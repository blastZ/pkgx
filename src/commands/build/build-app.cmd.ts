import { type Command } from 'commander';
import { $ } from 'zx';

import { NpmGenerator } from '@libs/pkgx-generator-npm';
import { BuildExecutor } from '@libs/pkgx-plugin-rollup';

import { CmdBuildPackageOptions, PkgxCmdOptions } from '@/interfaces';
import { changeWorkingDirectory, getPkgxOptions } from '@/utils';

async function build(
  pkgRelativePath: string,
  cmdOptions: CmdBuildPackageOptions & PkgxCmdOptions,
) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, {
    isApp: true,
  });

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  const executor = new BuildExecutor(pkgxOptions);

  await executor.run();

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  const npmGenerator = new NpmGenerator(pkgxOptions);

  await npmGenerator.generatePackageJsonFile();
  await npmGenerator.generateCjsPackageJsonFile();

  return {
    pkgxOptions,
  };
}

async function buildApp(
  pkgRelativePath: string,
  cmdOptions: CmdBuildPackageOptions & PkgxCmdOptions,
) {
  await build(pkgRelativePath, cmdOptions);
}

export function createBuildAppCommand(buildCommand: Command) {
  const command = buildCommand
    .command('application')
    .alias('app')
    .description('build application based package')
    .action(buildApp);

  return command;
}

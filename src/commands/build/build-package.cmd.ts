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

  const pkgxOptions = await getPkgxOptions(cmdOptions);

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  const executor = new BuildExecutor(pkgxOptions);

  await executor.run();

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  const npmGenerator = new NpmGenerator(pkgxOptions);

  await npmGenerator.generatePackageJsonFile();
  await npmGenerator.generateCjsPackageJsonFile();

  if (cmdOptions.pack) {
    await $`cd ${outputDirName} && npm pack`.quiet();
  }
}

async function buildPackage(
  pkgRelativePath: string,
  cmdOptions: CmdBuildPackageOptions & PkgxCmdOptions,
) {
  await build(pkgRelativePath, cmdOptions);
}

export function createBuildPackageCommand(buildCommand: Command) {
  const command = buildCommand
    .command('package', { isDefault: true })
    .description('build package')
    .option('--pack', 'pack package after build')
    .action(buildPackage);

  return command;
}

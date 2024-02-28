import { type Command } from 'commander';
import { $ } from 'zx';

import {
  CjsPackageJsonFileGenerator,
  PackageJsonFileGenerator,
} from '@libs/pkgx-plugin-npm';
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

  await new BuildExecutor(pkgxOptions).run();

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  await new PackageJsonFileGenerator(pkgxOptions).run();
  await new CjsPackageJsonFileGenerator(pkgxOptions).run();

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

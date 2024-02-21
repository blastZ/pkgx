import { type Command } from 'commander';
import { $ } from 'zx';

import { RollupExecutor } from '@/executors/rollup';
import { CmdBuildPackageOptions, PkgxCmdOptions } from '@/interfaces';
import {
  addCjsPackageJsonFile,
  addPackageJsonFile,
  changeWorkingDirectory,
  getPkgxOptions,
} from '@/utils';

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

  const executor = new RollupExecutor();

  await executor.build(pkgxOptions);

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  await addPackageJsonFile(pkgxOptions);
  await addCjsPackageJsonFile(pkgxOptions);

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

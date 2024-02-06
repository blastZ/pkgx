import { $ } from 'zx';

import { RollupExecutor } from '../../executors/rollup/index.js';
import {
  CmdBuildPackageOptions,
  PkgxCmdOptions,
} from '../../interfaces/index.js';
import {
  addCjsPackageJsonFile,
  addPackageJsonFile,
  changeWorkingDirectory,
  getPkgxOptions,
} from '../../utils/index.js';

async function build(
  pkgRelativePath: string,
  cmdOptions: CmdBuildPackageOptions & PkgxCmdOptions,
) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions(cmdOptions);

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  const executor = new RollupExecutor();

  await executor.build(pkgxOptions);

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  await addPackageJsonFile(pkgxOptions);
  await addCjsPackageJsonFile(pkgxOptions);

  if (cmdOptions.pack) {
    await $`cd ${outputDirName} && npm pack`.quiet();
  }
}

export async function buildPackageCommand(
  pkgRelativePath: string,
  cmdOptions: CmdBuildPackageOptions & PkgxCmdOptions,
) {
  await build(pkgRelativePath, cmdOptions);
}

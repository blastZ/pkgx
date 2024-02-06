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

export async function buildAppCommand(
  pkgRelativePath: string,
  cmdOptions: CmdBuildPackageOptions & PkgxCmdOptions,
) {
  await build(pkgRelativePath, cmdOptions);
}

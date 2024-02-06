import { $, cd } from 'zx';

import { RollupExecutor } from '../executors/rollup/index.js';
import { PkgxCmdOptions } from '../interfaces/index.js';
import {
  addCjsPackageJsonFile,
  addPackageJsonFile,
  changeWorkingDirectory,
  getPkgxOptions,
} from '../utils/index.js';

async function publish(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions(cmdOptions);

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  const executor = new RollupExecutor();

  await executor.build(pkgxOptions);

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  await addPackageJsonFile(pkgxOptions);
  await addCjsPackageJsonFile(pkgxOptions);

  cd(pkgxOptions.outputDirName);

  await $`npm publish --access public --registry=https://registry.npmjs.org`;
}

export async function publishCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await publish(pkgRelativePath, cmdOptions);
}

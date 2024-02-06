import { $ } from 'zx';

import { RollupExecutor } from '../executors/rollup/index.js';
import { PkgxCmdOptions } from '../interfaces/index.js';
import { changeWorkingDirectory, getPkgxOptions } from '../utils/index.js';

async function test(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, { isTest: true });

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  const executor = new RollupExecutor();

  await executor.build(pkgxOptions);

  await $`rm -rf ${outputDirName}/esm/.dts`.quiet();

  $`node --enable-source-maps ${pkgxOptions.outputDirName}/esm/index.js`;
}

export async function testCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await test(pkgRelativePath, cmdOptions);
}

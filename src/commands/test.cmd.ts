import { $ } from 'zx';

import { BuildExecutor } from '@libs/pkgx-plugin-rollup';

import { PkgxCmdOptions } from '../interfaces/index.js';
import { changeWorkingDirectory, getPkgxOptions } from '../utils/index.js';

async function test(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, { isTest: true });

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  await new BuildExecutor(pkgxOptions).run();

  $`node --enable-source-maps ${pkgxOptions.outputDirName}/esm/index.js`;
}

export async function testCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await test(pkgRelativePath, cmdOptions);
}

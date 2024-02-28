import { $, cd } from 'zx';

import {
  CjsPackageJsonFileGenerator,
  PackageJsonFileGenerator,
} from '@libs/pkgx-plugin-npm';
import { BuildExecutor } from '@libs/pkgx-plugin-rollup';

import { PkgxCmdOptions } from '../interfaces/index.js';
import { changeWorkingDirectory, getPkgxOptions } from '../utils/index.js';

async function publish(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions(cmdOptions);

  const outputDirName = pkgxOptions.outputDirName;

  await $`rm -rf ${outputDirName}`.quiet();

  await new BuildExecutor(pkgxOptions).run();

  await new PackageJsonFileGenerator(pkgxOptions).run();
  await new CjsPackageJsonFileGenerator(pkgxOptions).run();

  cd(pkgxOptions.outputDirName);

  await $`npm publish --access public --registry=https://registry.npmjs.org`;
}

export async function publishCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await publish(pkgRelativePath, cmdOptions);
}

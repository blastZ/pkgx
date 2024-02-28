import { $, cd } from 'zx';

import { NpmGenerator } from '@libs/pkgx-generator-npm';
import { BuildExecutor } from '@libs/pkgx-plugin-rollup';

import { PkgxCmdOptions } from '../interfaces/index.js';
import { changeWorkingDirectory, getPkgxOptions } from '../utils/index.js';

async function publish(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
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

  cd(pkgxOptions.outputDirName);

  await $`npm publish --access public --registry=https://registry.npmjs.org`;
}

export async function publishCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await publish(pkgRelativePath, cmdOptions);
}

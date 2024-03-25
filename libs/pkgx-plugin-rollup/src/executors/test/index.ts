import { $ } from 'zx';

import {
  changeWorkingDirectory,
  getPkgxConfigFileOptions,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';

import { BuildExecutor } from '../build/index.js';

export class TestExecutor {
  constructor(private context: PkgxContext) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const cmdOptions = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await getPkgxConfigFileOptions();

    const executor = new BuildExecutor(
      { ...pkgxOptions, ...cmdOptions },
      { isTest: true },
    );

    const filledPkgxOptions = await executor.getFilledPkgxOptions();

    const outputDirName = filledPkgxOptions.outputDirName;

    await $`rm -rf ${outputDirName}`.quiet();

    await executor.run();

    $`node --enable-source-maps ${filledPkgxOptions.outputDirName}/esm/index.js`;
  }
}

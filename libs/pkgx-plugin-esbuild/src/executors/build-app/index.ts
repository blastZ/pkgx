import { $ } from 'zx';

import {
  changeWorkingDirectory,
  readPkgxConfigFile,
  type PkgxCmdOptions,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';

import { BuildExecutor } from '../build/index.js';

export class BuildAppExecutor {
  constructor(private context: PkgxContext<PkgxCmdOptions>) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const options = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await readPkgxConfigFile();

    const executor = new BuildExecutor(
      { ...pkgxOptions, ...options },
      {
        isApp: true,
      },
    );

    const filledPkgxOptions = await executor.getFilledPkgxOptions();

    const outputDirName = filledPkgxOptions.outputDirName;

    await $`rm -rf ${outputDirName}`.quiet();

    await executor.run();
  }
}

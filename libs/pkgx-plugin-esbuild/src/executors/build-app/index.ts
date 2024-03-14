import { $ } from 'zx';

import {
  PkgxCmdOptions,
  PkgxContext,
  changeWorkingDirectory,
  getPkgxConfigFileOptions,
} from '@libs/pkgx-plugin-devkit';

import { BuildExecutor } from '../build/index.js';

export class BuildAppExecutor {
  constructor(private context: PkgxContext<PkgxCmdOptions>) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const options = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await getPkgxConfigFileOptions();

    const executor = new BuildExecutor({ ...pkgxOptions, ...options });

    const filledPkgxOptions = await executor.getFilledPkgxOptions();

    const outputDirName = filledPkgxOptions.outputDirName;

    await $`rm -rf ${outputDirName}`.quiet();

    await executor.run();
  }
}

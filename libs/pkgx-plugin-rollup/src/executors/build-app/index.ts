import { $ } from 'zx';

import {
  PkgxContext,
  changeWorkingDirectory,
  getPkgxConfigFileOptions,
} from '@libs/pkgx-plugin-devkit';

import { CmdOptions } from '../../interfaces/cmd-options.interface.js';
import { BuildExecutor } from '../build/index.js';

export class BuildAppExecutor {
  constructor(private context: PkgxContext<CmdOptions>) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const options = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await getPkgxConfigFileOptions();

    const executor = new BuildExecutor(
      { ...pkgxOptions, ...options },
      { isApp: true },
    );

    const filledPkgxOptions = await executor.getFilledPkgxOptions();

    const outputDirName = filledPkgxOptions.outputDirName;

    await $`rm -rf ${outputDirName}`.quiet();

    await executor.run();
  }
}

import { $ } from 'zx';

import {
  changeWorkingDirectory,
  readPkgxConfigFile,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';

import { BuildExecutor } from '../build/index.js';

import type { BuildPackageOptions } from './build-package-options.interface.js';

export class BuildPackageExecutor {
  constructor(private context: PkgxContext<BuildPackageOptions>) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const options = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await readPkgxConfigFile();

    const executor = new BuildExecutor({ ...pkgxOptions, ...options });

    const filledPkgxOptions = await executor.getFilledPkgxOptions();

    const outputDirName = filledPkgxOptions.outputDirName;

    await $`rm -rf ${outputDirName}`.quiet();

    await executor.run();

    if (options.pack) {
      await $`cd ${outputDirName} && npm pack`.quiet();
    }
  }
}

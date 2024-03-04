import { $ } from 'zx';

import {
  PkgxContext,
  changeWorkingDirectory,
  getPkgxConfigFileOptions,
} from '@libs/pkgx-plugin-devkit';
import {
  CjsPackageJsonFileGenerator,
  PackageJsonFileGenerator,
} from '@libs/pkgx-plugin-npm';

import { getFilledPkgxOptions } from '../../utils/get-filled-pkgx-options.js';
import { BuildExecutor } from '../build/index.js';

import { BuildPackageOptions } from './build-package-options.interface.js';

export class BuildPackageExecutor {
  constructor(private context: PkgxContext<BuildPackageOptions>) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const options = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await getPkgxConfigFileOptions();

    const filledOptions = await getFilledPkgxOptions({
      ...pkgxOptions,
      ...options,
    });

    const outputDirName = filledOptions.outputDirName;

    await $`rm -rf ${outputDirName}`.quiet();

    await new BuildExecutor(filledOptions).run();

    await new PackageJsonFileGenerator(filledOptions).run();
    await new CjsPackageJsonFileGenerator(filledOptions).run();

    if (options.pack) {
      await $`cd ${outputDirName} && npm pack`.quiet();
    }
  }
}

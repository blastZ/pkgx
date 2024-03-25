import { resolve } from 'node:path';

import { $ } from 'zx';

import {
  changeWorkingDirectory,
  getFilledPkgxOptions,
  getPkgxConfigFileOptions,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';

export class BuildNextExecutor {
  constructor(private context: PkgxContext) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const cmdOptions = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await getPkgxConfigFileOptions();
    const filledPkgxOptions = await getFilledPkgxOptions({
      ...pkgxOptions,
      ...cmdOptions,
    });

    const nextDirPath = resolve(filledPkgxOptions.inputDir, 'next');
    const dotNextDirPath = resolve(nextDirPath, '.next');

    const outputNextDirPath = resolve(filledPkgxOptions.outputDirName, 'next');
    const outputDotNextDirPath = resolve(outputNextDirPath, '.next');

    await $`rm -rf ${dotNextDirPath}`.quiet();

    await $`pnpm next build ${nextDirPath}`;

    await $`rm -rf ${outputNextDirPath}`.quiet();

    await $`mkdir -p ${outputNextDirPath}`.quiet();

    await $`mv ${dotNextDirPath} ${outputNextDirPath}`.quiet();

    await $`rm -rf ${outputDotNextDirPath}/cache`.quiet();
  }
}

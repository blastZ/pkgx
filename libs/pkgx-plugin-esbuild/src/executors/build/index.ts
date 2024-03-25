import { build } from 'esbuild';

import {
  NpmHelper,
  copyFiles,
  getFilledPkgxOptions,
  type InternalOptions,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

import { getEsbuildOptions } from '../../core/get-esbuild-options.js';
import { logger } from '../../core/logger.js';

export class BuildExecutor {
  private filledPkgxOptions: Required<PkgxOptions> | undefined;

  constructor(
    private pkgxOptions: PkgxOptions,
    private internalOptions: InternalOptions = {},
  ) {}

  async getFilledPkgxOptions() {
    if (!this.filledPkgxOptions) {
      this.filledPkgxOptions = await getFilledPkgxOptions(
        this.pkgxOptions,
        this.internalOptions,
      );
    }

    return this.filledPkgxOptions;
  }

  async run() {
    const filledOptions = await this.getFilledPkgxOptions();

    const esbuildOptions = await getEsbuildOptions(filledOptions);

    await Promise.all(
      esbuildOptions.map(async (options) => {
        logger.logBundleInfo(options);

        const start = Date.now();

        await build(options);

        const time = Date.now() - start;

        logger.logBundleTime(options.outfile!, time);
      }),
    );

    await new NpmHelper(process.cwd(), filledOptions).generatePackageFiles();

    await copyFiles(filledOptions.assets, {
      destDir: filledOptions.outputDirName,
    });
  }
}

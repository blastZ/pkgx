import {
  rollup,
  type InputOptions,
  type OutputOptions,
  type RollupBuild,
  type RollupOptions,
} from 'rollup';
import { $ } from 'zx';

import {
  InternalOptions,
  PkgxOptions,
  copyFiles,
  getFilledPkgxOptions,
} from '@libs/pkgx-plugin-devkit';

import { CjsPackageJsonFileGenerator } from '../../generators/cjs-package-json-file/index.js';
import { PackageJsonFileGenerator } from '../../generators/package-json-file/index.js';
import { getRollupOptions } from '../../utils/get-rollup-options.js';
import { handleError } from '../../utils/handle-error.js';
import { logger } from '../../utils/logger.util.js';
import { relativeId } from '../../utils/relative-id.js';

export class BuildExecutor {
  private filledPkgxOptions: Required<PkgxOptions> | undefined;

  constructor(
    private pkgxOptions: PkgxOptions,
    private internalOptions: InternalOptions = {},
  ) {}

  async generateOutputs(
    bundle: RollupBuild,
    outputOptionsList: OutputOptions[],
  ) {
    for (const outputOptions of outputOptionsList) {
      await bundle.write(outputOptions);
      // const { output } = await bundle.write(outputOptions);

      // for (const chunkOrAsset of output) {
      //   if (chunkOrAsset.type === 'asset') {
      //     console.log('Asset', chunkOrAsset);
      //   } else {
      //     console.log('Chunk', chunkOrAsset.modules);
      //   }
      // }
    }
  }

  async startBundle(options: RollupOptions) {
    const start = Date.now();

    const inputOptions = options as InputOptions;
    const outputOptionsList = options.output as OutputOptions[];

    const inputFiles = inputOptions.input;
    const outputFiles = outputOptionsList.map((o) =>
      relativeId(o.file || o.dir!),
    );

    logger.logBundleInfo(String(inputFiles!), outputFiles.join(', '));

    let bundle: RollupBuild | undefined;
    try {
      bundle = await rollup(options);

      await this.generateOutputs(bundle, outputOptionsList);
    } catch (err: any) {
      handleError(err);
    } finally {
      if (bundle) {
        await bundle.close();
      }
    }

    logger.logBundleTime(outputFiles.join(', '), Date.now() - start);
  }

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

    const rollupOptions = await getRollupOptions(filledOptions);

    for (const options of rollupOptions) {
      await this.startBundle(options);
    }

    await $`rm -rf ${filledOptions.outputDirName}/esm/.dts`.quiet();

    await new PackageJsonFileGenerator(filledOptions).run();
    await new CjsPackageJsonFileGenerator(filledOptions).run();

    await copyFiles(filledOptions.assets, {
      destDir: filledOptions.outputDirName,
    });
  }
}

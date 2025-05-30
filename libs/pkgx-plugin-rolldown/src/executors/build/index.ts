import {
  rolldown,
  type InputOptions,
  type OutputOptions,
  type RolldownBuild,
  type RolldownOptions,
} from 'rolldown';
import { $ } from 'zx';

import {
  NpmHelper,
  copyFiles,
  getFilledPkgxOptions,
  type InternalOptions,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';
import { handleError, logger, relativeId } from '@libs/pkgx-plugin-rollup';

import { getRolldownOptions } from '../../core/get-rolldown-options.js';

export class BuildExecutor {
  private filledPkgxOptions: Required<PkgxOptions> | undefined;

  constructor(
    private pkgxOptions: PkgxOptions,
    private internalOptions: InternalOptions = {},
  ) {}

  async generateOutputs(
    bundle: RolldownBuild,
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

  async startBundle(options: RolldownOptions) {
    const start = Date.now();

    const inputOptions = options as InputOptions;
    const outputOptionsList = options.output as OutputOptions[];

    const inputFiles = inputOptions.input;
    const outputFiles = outputOptionsList.map((o) =>
      relativeId(o.file || o.dir!),
    );

    logger.logBundleInfo(String(inputFiles!), outputFiles.join(', '));

    let bundle: RolldownBuild | undefined;
    try {
      bundle = await rolldown(options);

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

    const rolldownOptions = await getRolldownOptions(filledOptions);

    for (const options of rolldownOptions) {
      await this.startBundle(options);
    }

    await $`rm -rf ${filledOptions.outputDirName}/esm/.dts`.quiet();

    await new NpmHelper(process.cwd(), filledOptions).generatePackageFiles();

    await copyFiles(filledOptions.assets, {
      destDir: filledOptions.outputDirName,
    });
  }
}

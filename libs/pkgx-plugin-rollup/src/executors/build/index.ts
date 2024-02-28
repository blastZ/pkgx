import {
  rollup,
  type InputOptions,
  type OutputOptions,
  type RollupBuild,
  type RollupOptions,
} from 'rollup';

import { PkgxOptions } from '@/interfaces';
import { copyFiles, logger, parseAssets } from '@/utils';

import { getRollupOptions } from '../../utils/get-rollup-options.js';
import { handleError } from '../../utils/handle-error.js';
import { relativeId } from '../../utils/relative-id.js';

export class BuildExecutor {
  constructor(private pkgxOptions: Required<PkgxOptions>) {}

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

  async run() {
    const rollupOptions = getRollupOptions(this.pkgxOptions);

    for (const options of rollupOptions) {
      await this.startBundle(options);
    }

    await copyFiles(parseAssets(this.pkgxOptions));
  }
}
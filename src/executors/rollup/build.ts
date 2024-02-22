import {
  rollup,
  type InputOptions,
  type OutputOptions,
  type RollupBuild,
  type RollupOptions,
} from 'rollup';

import { logger } from '@/utils';

import { handleError } from './utils/handle-error.js';
import { relativeId } from './utils/relative-id.js';

export async function generateOutputs(
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

export async function startBundle(options: RollupOptions) {
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

    await generateOutputs(bundle, outputOptionsList);
  } catch (err: any) {
    handleError(err);
  } finally {
    if (bundle) {
      await bundle.close();
    }
  }

  logger.logBundleTime(outputFiles.join(', '), Date.now() - start);
}

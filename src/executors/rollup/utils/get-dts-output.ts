import { dirname, relative, resolve } from 'node:path';

import { type RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';

import { PkgxOptions } from '../../../interfaces/index.js';
import { getTsconfigJson } from '../../../utils/index.js';

export function getDtsOutput(options: Required<PkgxOptions>) {
  const inputFileName = options.esmInputFileName.slice(0, -3) + '.d.ts';
  const outputDir = `${options.outputDirName}`;

  const tsconfigJson = getTsconfigJson();

  let targetDir = '';

  if (tsconfigJson.extends) {
    targetDir = relative(
      resolve('.', dirname(tsconfigJson.extends)),
      resolve('.'),
    );
  }

  const dtsInput = `${outputDir}/esm/.dts/${targetDir}/${options.inputDir}/${inputFileName}`;

  const output: RollupOptions = {
    input: dtsInput,
    output: [
      {
        file: `${outputDir}/index.d.ts`,
        format: 'esm',
      },
    ],
    plugins: [dts()],
    external: options.external,
    cache: options.cache,
  };

  return output;
}

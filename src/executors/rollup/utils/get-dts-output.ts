import { dirname, join, relative, resolve } from 'node:path';

import alias from '@rollup/plugin-alias';
import { type RollupOptions } from 'rollup';
import { dts } from 'rollup-plugin-dts';

import { getTsconfigJson } from '@libs/pkgx-common';

import { PkgxOptions } from '@/interfaces';

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

  const dtsInput = join(
    outputDir,
    'esm/.dts',
    targetDir,
    options.inputDir,
    inputFileName,
  );

  const output: RollupOptions = {
    input: dtsInput,
    output: [
      {
        file: `${outputDir}/index.d.ts`,
        format: 'esm',
      },
    ],
    plugins: [
      (alias as unknown as typeof alias.default)({
        entries: [
          {
            find: '@',
            replacement: resolve(
              process.cwd(),
              options.outputDirName,
              './esm/.dts',
              options.inputDir,
            ),
          },
          ...Object.entries(options.alias).map(([origin, target]) => {
            return {
              find: origin,
              replacement: resolve(process.cwd(), target),
            };
          }),
        ],
      }),
      dts(),
    ],
    external: options.external,
    cache: options.cache,
  };

  return output;
}

import { type RollupOptions } from 'rollup';

import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getCommonjsPlugin } from './plugins/get-commonjs-plugin.js';
import { getJsonPlugin } from './plugins/get-json-plugin.js';
import { getNodeResolvePlugin } from './plugins/get-node-resolve-plugin.js';
import { getTypescriptPlugin } from './plugins/get-typescript-plugin.js';

export function getCjsOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/cjs`;

  const output: RollupOptions = {
    input: `${options.inputDir}/${options.cjsInputFileName}`,
    output: [
      {
        file: `${outputDir}/index.js`,
        format: 'cjs',
        sourcemap: options.sourceMap,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      getTypescriptPlugin('cjs', options),
      getNodeResolvePlugin(),
      getCommonjsPlugin(),
      getJsonPlugin(),
    ],
    external: options.cjsExternal,
    cache: options.cache,
  };

  return output;
}

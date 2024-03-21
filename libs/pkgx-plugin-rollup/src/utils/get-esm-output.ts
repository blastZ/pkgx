import { type InputPluginOption, type RollupOptions } from 'rollup';

import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getCommonjsPlugin } from './plugins/get-commonjs-plugin.js';
import { getEsmShimPlugin } from './plugins/get-esm-shim-plugin.js';
import { getJsonPlugin } from './plugins/get-json-plugin.js';
import { getNodeResolvePlugin } from './plugins/get-node-resolve-plugin.js';
import { getTypescriptPlugin } from './plugins/get-typescript-plugin.js';

export function getEsmOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/esm`;

  const plugins: InputPluginOption = [];

  plugins.push(getTypescriptPlugin('esm', options));

  plugins.push(getNodeResolvePlugin());

  if (options.esmShim) {
    plugins.push(getEsmShimPlugin());
  }

  plugins.push(getCommonjsPlugin());

  plugins.push(getJsonPlugin());

  const output: RollupOptions = {
    input: `${options.inputDir}/${options.esmInputFileName}`,
    output: [
      {
        file: `${outputDir}/index.js`,
        format: 'esm',
        sourcemap: options.sourceMap,
        inlineDynamicImports: true,
      },
    ],
    plugins,
    external: options.external,
    cache: options.cache,
  };

  return output;
}

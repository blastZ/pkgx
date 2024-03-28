import { type InputPluginOption, type RollupOptions } from 'rollup';

import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getInput } from './get-input.js';
import { getOutputDir } from './get-output-dir.js';
import { getCommonjsPlugin } from './plugins/get-commonjs-plugin.js';
import { getEsmShimPlugin } from './plugins/get-esm-shim-plugin.js';
import { getJsonPlugin } from './plugins/get-json-plugin.js';
import { getNodeResolvePlugin } from './plugins/get-node-resolve-plugin.js';
import { getTypescriptPlugin } from './plugins/get-typescript-plugin.js';

export async function getOutput(
  type: OutputType,
  options: Required<PkgxOptions>,
) {
  const outputDir = getOutputDir(type, options);

  const plugins: InputPluginOption = [];

  plugins.push(await getTypescriptPlugin(type, options));

  plugins.push(getNodeResolvePlugin());

  if (type !== OutputType.CJS && options.esmShim) {
    plugins.push(getEsmShimPlugin());
  }

  plugins.push(getCommonjsPlugin());

  plugins.push(getJsonPlugin());

  const output: RollupOptions = {
    input: getInput(type, options),
    output: [
      {
        file: `${outputDir}/index.js`,
        format: type === OutputType.CJS ? 'cjs' : 'esm',
        sourcemap: options.sourceMap,
        inlineDynamicImports: true,
      },
    ],
    plugins,
    external: type === OutputType.CJS ? options.cjsExternal : options.external,
    cache: options.cache,
  };

  return output;
}

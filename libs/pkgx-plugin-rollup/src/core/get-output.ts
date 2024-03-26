import { type InputPluginOption, type RollupOptions } from 'rollup';

import { OutputType, PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getOutputDir } from './get-output-dir.js';
import { getCommonjsPlugin } from './plugins/get-commonjs-plugin.js';
import { getEsmShimPlugin } from './plugins/get-esm-shim-plugin.js';
import { getJsonPlugin } from './plugins/get-json-plugin.js';
import { getNodeResolvePlugin } from './plugins/get-node-resolve-plugin.js';
import { getTypescriptPlugin } from './plugins/get-typescript-plugin.js';

function getInput(type: OutputType, options: Required<PkgxOptions>) {
  let inputFileName = options.inputFileName;

  if (type === OutputType.ESM) {
    inputFileName = options.esmInputFileName;
  }

  if (type === OutputType.CJS) {
    inputFileName = options.cjsInputFileName;
  }

  if (type === OutputType.BIN) {
    inputFileName = options.cliInputFileName;
  }

  return `${options.inputDir}/${inputFileName}`;
}

export function getOutput(type: OutputType, options: Required<PkgxOptions>) {
  const outputDir = getOutputDir(type, options);

  const plugins: InputPluginOption = [];

  plugins.push(getTypescriptPlugin(type, options));

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

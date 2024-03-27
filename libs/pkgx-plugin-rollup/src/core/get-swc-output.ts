// import swc from '@rollup/plugin-swc';
import { type InputPluginOption, type RollupOptions } from 'rollup';

import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getInput } from './get-input.js';
import { getOutputDir } from './get-output-dir.js';
import { getSwcAliasPlugin } from './swc-plugins/get-swc-alias-plugin.js';
import { getSwcNodeResolvePlugin } from './swc-plugins/get-swc-node-resolve-plugin.js';
import { getSwcPlugin } from './swc-plugins/get-swc-plugin.js';

export async function getSwcOutput(
  type: OutputType,
  options: Required<PkgxOptions>,
) {
  const outputDir = getOutputDir(type, options);

  const plugins: InputPluginOption = [];

  plugins.push(getSwcNodeResolvePlugin());

  plugins.push(await getSwcAliasPlugin(options));

  plugins.push(getSwcPlugin(options));

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

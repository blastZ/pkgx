import { type InputPluginOption, type RollupOptions } from 'rollup';

import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getInput } from './get-input.js';
import { getGraphPlugin } from './plugins/get-graph-plugin.js';
import { getSwcAliasPlugin } from './swc-plugins/get-swc-alias-plugin.js';
import { getSwcNodeResolvePlugin } from './swc-plugins/get-swc-node-resolve-plugin.js';

export async function getGraphOutput(
  type: OutputType,
  options: Required<PkgxOptions>,
) {
  const plugins: InputPluginOption = [];

  plugins.push(getSwcNodeResolvePlugin());

  plugins.push(await getSwcAliasPlugin(options));

  plugins.push(await getGraphPlugin(options));

  const output: RollupOptions = {
    input: getInput(type, options),
    plugins,
    external: type === OutputType.CJS ? options.cjsExternal : options.external,
    cache: options.cache,
    logLevel: 'silent',
  };

  return output;
}

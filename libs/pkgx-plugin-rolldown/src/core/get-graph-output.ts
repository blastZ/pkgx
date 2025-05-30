import { type RolldownOptions, type RolldownPluginOption } from 'rolldown';

import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';
import { getGraphPlugin, getInput } from '@libs/pkgx-plugin-rollup';

export async function getGraphOutput(
  type: OutputType,
  options: Required<PkgxOptions>,
) {
  const plugins: RolldownPluginOption = [];

  plugins.push(await getGraphPlugin(options));

  const output: RolldownOptions = {
    input: getInput(type, options),
    plugins,
    external: type === OutputType.CJS ? options.cjsExternal : options.external,
    logLevel: 'silent',
  };

  return output;
}

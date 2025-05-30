import { type RolldownOptions, type RolldownPluginOption } from 'rolldown';

import {
  OutputType,
  parseTsconfigJsonFiles,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';
import {
  getEsmShimPlugin,
  getInput,
  getJsonPlugin,
  getOutputDir,
  getReplacePlugin,
} from '@libs/pkgx-plugin-rollup';

export async function getOutput(
  type: OutputType,
  options: Required<PkgxOptions>,
) {
  const outputDir = getOutputDir(type, options);

  const { tsconfigJsonPath } = await parseTsconfigJsonFiles(process.cwd());

  const plugins: RolldownPluginOption = [];

  if (type !== OutputType.CJS && options.esmShim) {
    plugins.push(getEsmShimPlugin());
  }

  plugins.push(getJsonPlugin());

  if (
    typeof options.replaceValues === 'object' &&
    Object.keys(options.replaceValues).length > 0
  ) {
    plugins.push(getReplacePlugin(options));
  }

  const output: RolldownOptions = {
    input: getInput(type, options),
    output: [
      {
        file: `${outputDir}/index.js`,
        format: 'esm',
        sourcemap: options.sourceMap,
        inlineDynamicImports: true,
      },
    ],
    resolve: {
      tsconfigFilename: tsconfigJsonPath,
    },
    plugins,
    external: options.external,
    jsx: 'react',
  };

  return output;
}

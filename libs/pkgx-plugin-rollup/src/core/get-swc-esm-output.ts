import swc from '@rollup/plugin-swc';
import { type InputPluginOption, type RollupOptions } from 'rollup';

import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getSwcAliasPlugin } from './swc-plugins/get-swc-alias-plugin.js';
import { getSwcNodeResolvePlugin } from './swc-plugins/get-swc-node-resolve-plugin.js';

export async function getSwcEsmOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/esm`;

  const plugins: InputPluginOption = [];

  plugins.push(getSwcNodeResolvePlugin());

  plugins.push(await getSwcAliasPlugin(options));

  plugins.push(
    (swc as unknown as typeof swc.default)({
      swc: {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          target: 'esnext',
        },
      },
    }),
  );

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

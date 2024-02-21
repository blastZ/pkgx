import commonjs from '@rollup/plugin-commonjs';
import esmShim from '@rollup/plugin-esm-shim';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { type InputPluginOption, type RollupOptions } from 'rollup';

import { PkgxOptions } from '../../../interfaces/index.js';

import { getNodeResolveOptions } from './get-node-resolve-options.js';
import { getTypescriptOptions } from './get-typescript-options.js';

export function getCliOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/bin`;

  const plugins: InputPluginOption = [];

  plugins.push(
    (typescript as unknown as typeof typescript.default)(
      getTypescriptOptions('bin', options),
    ),
  );

  plugins.push(nodeResolve(getNodeResolveOptions()));

  if (options.esmShim) {
    plugins.push((esmShim as unknown as typeof esmShim.default)());
  }

  plugins.push((commonjs as unknown as typeof commonjs.default)());

  plugins.push((json as unknown as typeof json.default)());

  const output: RollupOptions = {
    input: `${options.inputDir}/${options.cliInputFileName}`,
    output: [
      {
        file: `${outputDir}/index.js`,
        format: 'esm',
        sourcemap: options.sourceMap,
      },
    ],
    plugins,
    external: options.external,
    cache: options.cache,
  };

  return output;
}
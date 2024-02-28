import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';

import { PkgxOptions } from '@/interfaces';

import { getNodeResolveOptions } from './get-node-resolve-options.js';
import { getTypescriptOptions } from './get-typescript-options.js';

export function getCjsOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/cjs`;

  const output: RollupOptions = {
    input: `${options.inputDir}/${options.cjsInputFileName}`,
    output: [
      {
        file: `${outputDir}/index.js`,
        format: 'cjs',
        sourcemap: options.sourceMap,
      },
    ],
    plugins: [
      (typescript as unknown as typeof typescript.default)(
        getTypescriptOptions('cjs', options),
      ),
      nodeResolve(getNodeResolveOptions()),
      (commonjs as unknown as typeof commonjs.default)(),
      (json as unknown as typeof json.default)(),
    ],
    external: options.cjsExternal,
    cache: options.cache,
  };

  return output;
}
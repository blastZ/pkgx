import { resolve } from 'node:path';

import { type RollupTypescriptOptions as RollupTypeScriptOptions } from '@rollup/plugin-typescript';

import { PkgxOptions } from '../../../interfaces/index.js';

export function getTypescriptOptions(
  type: 'esm' | 'cjs' | 'bin',
  options: Required<PkgxOptions>,
) {
  const outputDir = `${options.outputDirName}/${type}`;

  const tsOptions: RollupTypeScriptOptions = {
    outDir: outputDir,
    module: 'NodeNext',
    exclude: options.exclude,
    sourceMap: options.sourceMap,
    sourceRoot: options.sourceMap
      ? resolve(process.cwd(), '../../') // fix relativeSourcePath
      : undefined,
    incremental: options.incremental,
  };

  if (type === 'esm') {
    tsOptions.declaration = true;
    tsOptions.declarationMap = false;
    tsOptions.declarationDir = outputDir + '/.dts';
  } else {
    tsOptions.declaration = false;
    tsOptions.declarationMap = false;
  }

  return tsOptions;
}

import { resolve } from 'node:path';

import { type RollupTypescriptOptions as RollupTypeScriptOptions } from '@rollup/plugin-typescript';

import { PackageType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

export function getTypescriptOptions(
  type: 'esm' | 'cjs' | 'bin',
  options: Required<PkgxOptions>,
) {
  const outputDir = `${options.outputDirName}/${type}`;

  const tsOptions: RollupTypeScriptOptions = {
    outDir: outputDir,
    module:
      options.packageType === PackageType.Commonjs ? 'esnext' : 'NodeNext',
    exclude: options.exclude,
    sourceMap: options.sourceMap,
    sourceRoot: options.sourceMap
      ? resolve(process.cwd(), '../../') // fix relativeSourcePath
      : undefined,
    incremental: options.incremental,
  };

  if (type === 'esm' && !options.disableDtsOutput) {
    tsOptions.declaration = true;
    tsOptions.declarationMap = false;
    tsOptions.declarationDir = outputDir + '/.dts';
  } else {
    tsOptions.declaration = false;
    tsOptions.declarationMap = false;
  }

  return tsOptions;
}

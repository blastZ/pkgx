import { resolve } from 'node:path';

import typescript, {
  type RollupTypescriptOptions as RollupTypeScriptOptions,
} from '@rollup/plugin-typescript';
import { type InputPluginOption } from 'rollup';

import {
  OutputType,
  PackageType,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

import { getOutputDir } from '../get-output-dir.js';

export function getTypescriptPlugin(
  type: OutputType,
  options: Required<PkgxOptions>,
): InputPluginOption {
  const outputDir = getOutputDir(type, options);

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

  if (type === OutputType.ESM && !options.disableDtsOutput) {
    tsOptions.declaration = true;
    tsOptions.declarationMap = false;
    tsOptions.declarationDir = outputDir + '/.dts';
  } else {
    tsOptions.declaration = false;
    tsOptions.declarationMap = false;
  }

  return (typescript as unknown as typeof typescript.default)(tsOptions);
}

import type { BuildOptions, Plugin } from 'esbuild';

import {
  OutputType,
  parseTsconfigJsonFiles,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

import { isResolveNeeded } from './is-resolve-needed.js';
import { isTransformNeeded } from './is-transform-needed.js';
import { getNodeResolvePlugin } from './plugins/get-node-resolve-plugin.js';
import { getSwcPlugin } from './plugins/get-swc-plugin.js';

export async function getOutput(
  type: OutputType,
  options: Required<PkgxOptions>,
) {
  const outputDir =
    type === OutputType.ESM
      ? `${options.outputDirName}/esm`
      : `${options.outputDirName}/cjs`;

  const input = `${options.inputDir}/${options.esmInputFileName}`;

  const { tsconfigJsonPath } = await parseTsconfigJsonFiles(process.cwd());

  const plugins: Plugin[] = [];

  const isResolve = isResolveNeeded(options);
  const isTransform = await isTransformNeeded();

  if (isResolve) {
    plugins.push(await getNodeResolvePlugin(type, options));
  }

  if (isTransform) {
    plugins.push(getSwcPlugin(options));

    // plugins.push(getTypescriptPlugin());
  }

  const output: BuildOptions = {
    entryPoints: [input],
    bundle: true,
    outfile: `${outputDir}/index.js`,
    format: type === OutputType.ESM ? 'esm' : 'cjs',
    // esbuild must explicitly set working directory
    absWorkingDir: process.cwd(),
    plugins,
    sourcemap: options.sourceMap,
    tsconfig: tsconfigJsonPath,
  };

  if (!isResolve) {
    output.packages = 'external';
  }

  return output;
}

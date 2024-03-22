import type { BuildOptions, Plugin } from 'esbuild';

import { PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { isTransformNeeded } from './is-transform-needed.js';
import { getSwcPlugin } from './plugins/get-swc-plugin.js';
import { getTypescriptPlugin } from './plugins/get-typescript-plugin.js';

export async function getCjsOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/cjs`;

  const input = `${options.inputDir}/${options.esmInputFileName}`;

  const plugins: Plugin[] = [];

  if (await isTransformNeeded()) {
    if (options.useSwc) {
      plugins.push(getSwcPlugin());
    } else {
      plugins.push(getTypescriptPlugin());
    }
  }

  const output: BuildOptions = {
    entryPoints: [input],
    bundle: true,
    outfile: `${outputDir}/index.js`,
    format: 'cjs',
    packages: 'external',
    // esbuild must explicitly set working directory
    absWorkingDir: process.cwd(),
    plugins,
  };

  return output;
}

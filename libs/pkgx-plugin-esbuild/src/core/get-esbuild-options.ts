import type { BuildOptions } from 'esbuild';

import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getCjsOutput } from './get-cjs-output.js';
import { getEsmOutput } from './get-esm-output.js';

export async function getEsbuildOptions(options: Required<PkgxOptions>) {
  const outputs: BuildOptions[] = [];

  if (!options.disableEsmOutput) {
    const esmOutput = await getEsmOutput(options);

    outputs.push(esmOutput);
  }

  if (!options.disableCjsOutput) {
    const cjsOutput = await getCjsOutput(options);

    outputs.push(cjsOutput);
  }

  return outputs;
}

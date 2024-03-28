import { type RollupOptions } from 'rollup';

import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getCjsOutput } from './get-cjs-output.js';
import { getCliOutput } from './get-cli-output.js';
import { getDtsOutput } from './get-dts-output.js';
import { getEsmOutput } from './get-esm-output.js';
import { getSwcCjsOutput } from './get-swc-cjs-output.js';
import { getSwcEsmOutput } from './get-swc-esm-output.js';

export async function getRollupOptions(options: Required<PkgxOptions>) {
  const outputs: RollupOptions[] = [];

  if (!options.disableEsmOutput) {
    const esmOutput = options.skipTypeCheck
      ? await getSwcEsmOutput(options)
      : await getEsmOutput(options);

    outputs.push(esmOutput);
  }

  if (!options.disableCjsOutput) {
    const cjsOutput = options.skipTypeCheck
      ? await getSwcCjsOutput(options)
      : await getCjsOutput(options);

    outputs.push(cjsOutput);
  }

  if (!options.disableDtsOutput) {
    const dtsOutput = await getDtsOutput(options);

    outputs.push(dtsOutput);
  }

  if (options.cliInputFileName) {
    const cliOutput = await getCliOutput(options);

    outputs.push(cliOutput);
  }

  return outputs;
}

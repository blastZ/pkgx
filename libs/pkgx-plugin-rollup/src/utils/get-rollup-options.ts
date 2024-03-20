import { type RollupOptions } from 'rollup';

import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getCjsOutput } from './get-cjs-output.js';
import { getCliOutput } from './get-cli-output.js';
import { getDtsOutput } from './get-dts-output.js';
import { getEsmOutput } from './get-esm-output.js';
import { getSwcEsmOutput } from './get-swc-esm-output.js';

export async function getRollupOptions(options: Required<PkgxOptions>) {
  const outputs: RollupOptions[] = [];

  if (!options.disableEsmOutput) {
    if (options.useSwc) {
      const esmOutput = await getSwcEsmOutput(options);

      outputs.push(esmOutput);
    } else {
      const esmOutput = getEsmOutput(options);

      outputs.push(esmOutput);
    }
  }

  if (!options.disableCjsOutput) {
    const cjsOutput = getCjsOutput(options);

    outputs.push(cjsOutput);
  }

  if (!options.disableDtsOutput) {
    const dtsOutput = await getDtsOutput(options);

    outputs.push(dtsOutput);
  }

  if (options.cliInputFileName) {
    const cliOutput = getCliOutput(options);

    outputs.push(cliOutput);
  }

  return outputs;
}

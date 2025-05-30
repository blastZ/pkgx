import { type RolldownOptions } from 'rolldown';

import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getCliOutput } from './get-cli-output.js';
import { getDtsOutput } from './get-dts-output.js';
import { getEsmOutput } from './get-esm-output.js';

export async function getRolldownOptions(options: Required<PkgxOptions>) {
  const outputs: RolldownOptions[] = [];

  if (!options.disableEsmOutput) {
    const esmOutput = await getEsmOutput(options);

    outputs.push(esmOutput);
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

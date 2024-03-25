import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getOutput } from './get-output.js';

export async function getEsmOutput(options: Required<PkgxOptions>) {
  const output = getOutput(OutputType.ESM, options);

  return output;
}

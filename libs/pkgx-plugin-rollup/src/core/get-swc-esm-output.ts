import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getSwcOutput } from './get-swc-output.js';

export async function getSwcEsmOutput(options: Required<PkgxOptions>) {
  const output = getSwcOutput(OutputType.ESM, options);

  return output;
}

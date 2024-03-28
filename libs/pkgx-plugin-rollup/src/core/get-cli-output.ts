import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getOutput } from './get-output.js';

export async function getCliOutput(options: Required<PkgxOptions>) {
  const output = await getOutput(OutputType.BIN, options);

  return output;
}

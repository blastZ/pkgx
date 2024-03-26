import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getOutput } from './get-output.js';

export function getCliOutput(options: Required<PkgxOptions>) {
  const output = getOutput(OutputType.BIN, options);

  return output;
}

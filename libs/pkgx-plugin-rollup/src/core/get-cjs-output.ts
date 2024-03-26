import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getOutput } from './get-output.js';

export function getCjsOutput(options: Required<PkgxOptions>) {
  const output = getOutput(OutputType.CJS, options);

  return output;
}

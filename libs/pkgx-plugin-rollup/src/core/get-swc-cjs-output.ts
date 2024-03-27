import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getSwcOutput } from './get-swc-output.js';

export async function getSwcCjsOutput(options: Required<PkgxOptions>) {
  const output = getSwcOutput(OutputType.CJS, options);

  return output;
}

import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getOutput } from './get-output.js';

export async function getCjsOutput(options: Required<PkgxOptions>) {
  const output = await getOutput(OutputType.CJS, options);

  return output;
}

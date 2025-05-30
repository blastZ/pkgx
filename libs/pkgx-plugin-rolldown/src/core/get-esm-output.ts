import type { RolldownOptions } from 'rolldown';

import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getOutput } from './get-output.js';

export async function getEsmOutput(
  options: Required<PkgxOptions>,
): Promise<RolldownOptions> {
  const output = await getOutput(OutputType.ESM, options);

  return output;
}

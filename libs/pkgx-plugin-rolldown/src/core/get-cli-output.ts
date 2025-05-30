import type { RolldownOptions } from 'rolldown';

import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { getOutput } from './get-output.js';

export async function getCliOutput(
  options: Required<PkgxOptions>,
): Promise<RolldownOptions> {
  const output = await getOutput(OutputType.BIN, options);

  return output;
}

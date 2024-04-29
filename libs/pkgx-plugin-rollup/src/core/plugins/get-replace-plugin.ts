import replace from '@rollup/plugin-replace';
import type { InputPluginOption } from 'rollup';

import type { PkgxOptions } from '@libs/pkgx-plugin-devkit';

export function getReplacePlugin(
  options: Required<PkgxOptions>,
): InputPluginOption {
  return (replace as unknown as typeof replace.default)({
    values: options.replaceValues,
    preventAssignment: true,
  });
}

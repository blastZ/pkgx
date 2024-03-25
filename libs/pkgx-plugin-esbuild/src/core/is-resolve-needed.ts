import type { PkgxOptions } from '@libs/pkgx-plugin-devkit';

export function isResolveNeeded(options: Required<PkgxOptions>) {
  if (options.excludeFromExternal && options.excludeFromExternal.length > 0) {
    return true;
  }

  if (
    !options.disableCjsOutput &&
    options.cjsExcludeFromExternal &&
    options.cjsExcludeFromExternal.length > 0
  ) {
    return true;
  }

  return false;
}

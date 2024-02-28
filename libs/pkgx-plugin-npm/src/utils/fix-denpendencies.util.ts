import { PkgxOptions } from '@/interfaces';

export function fixDependencies(
  pkgxOptions: Required<PkgxOptions>,
  originDependencies: Record<string, string>,
) {
  const targetDependencies: Record<string, string> = {};

  Object.keys(originDependencies).map((key) => {
    if (pkgxOptions.excludeFromExternal.includes(key)) {
      // do noting
    } else {
      targetDependencies[key] = originDependencies[key];
    }
  });

  if (Object.keys(targetDependencies).length < 1) {
    return undefined;
  }

  return targetDependencies;
}

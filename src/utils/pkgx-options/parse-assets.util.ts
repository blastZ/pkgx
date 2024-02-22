import { join, parse } from 'node:path';

import { CopyFilePattern, PkgxOptions } from '@/interfaces';

export function parseAssets(
  pkgxOptions: Required<PkgxOptions>,
): CopyFilePattern[] {
  return pkgxOptions.assets.map((o) => {
    if (typeof o === 'string') {
      const { dir, base } = parse(o);

      return {
        src: o,
        dest: join(pkgxOptions.outputDirName, dir, base),
      };
    }

    return o;
  });
}

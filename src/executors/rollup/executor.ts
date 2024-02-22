import { PkgxOptions } from '@/interfaces';
import { copyFiles, parseAssets } from '@/utils';

import { startBundle } from './build.js';
import { startWatch } from './serve.js';
import { getRollupOptions } from './utils/get-rollup-options.js';

export class RollupExecutor {
  async build(pkgxOptions: Required<PkgxOptions>) {
    const rollupOptions = getRollupOptions(pkgxOptions);

    for (const options of rollupOptions) {
      await startBundle(options);
    }

    await copyFiles(parseAssets(pkgxOptions));
  }

  async serve(pkgxOptions: Required<PkgxOptions>) {
    const rollupOptions = getRollupOptions(pkgxOptions);

    startWatch(pkgxOptions, rollupOptions);

    await copyFiles(parseAssets(pkgxOptions));
  }
}

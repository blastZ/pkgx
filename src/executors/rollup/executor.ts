import { PkgxOptions } from '../../interfaces/index.js';

import { startBundle } from './build.js';
import { startWatch } from './serve.js';
import { getRollupOptions } from './utils/get-rollup-options.js';

export class RollupExecutor {
  async build(pkgxOptions: Required<PkgxOptions>) {
    const rollupOptions = getRollupOptions(pkgxOptions);

    for (const options of rollupOptions) {
      await startBundle(options);
    }
  }

  serve(pkgxOptions: Required<PkgxOptions>) {
    const rollupOptions = getRollupOptions(pkgxOptions);

    startWatch(pkgxOptions, rollupOptions);
  }
}

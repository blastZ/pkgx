import { PkgxOptions } from '../../interfaces/index.js';
import { copyFiles } from '../../utils/file-system/copy-files.util.js';
import { parseAssets } from '../../utils/pkgx-options/parse-assets.util.js';

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

  serve(pkgxOptions: Required<PkgxOptions>) {
    const rollupOptions = getRollupOptions(pkgxOptions);

    startWatch(pkgxOptions, rollupOptions);
  }
}

import { resolve } from 'node:path';

import { cd } from 'zx';

import { RollupExecutor } from '../../executors/rollup/index.js';
import { PkgxCmdOptions } from '../../interfaces/index.js';
import { getPkgxOptions } from '../../utils/index.js';

async function serve(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, { isServe: true });

  const executor = new RollupExecutor();

  executor.serve(pkgxOptions);
}

export async function serveAppCommand(
  pkgRelativePath: string,
  cmdOptions: PkgxCmdOptions,
) {
  await serve(pkgRelativePath, cmdOptions);
}

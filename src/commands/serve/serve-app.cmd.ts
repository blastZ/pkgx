import { resolve } from 'node:path';

import { type Command } from 'commander';
import { cd } from 'zx';

import { RollupExecutor } from '@/executors/rollup';
import { PkgxCmdOptions } from '@/interfaces';
import { getPkgxOptions } from '@/utils';

async function serve(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const pkgxOptions = await getPkgxOptions(cmdOptions, { isServe: true });

  const executor = new RollupExecutor();

  executor.serve(pkgxOptions);
}

async function serveApp(pkgRelativePath: string, cmdOptions: PkgxCmdOptions) {
  await serve(pkgRelativePath, cmdOptions);
}

export function createServeAppCommand(serveCommand: Command) {
  const command = serveCommand
    .command('application', { isDefault: true })
    .alias('app')
    .description('serve application based package')
    .action(serveApp);

  return command;
}

import { Command } from 'commander';

import { addPackageRelativePathArg, addPkgxCmdOptions } from '@/utils';

import { createServeAppCommand } from './serve-app.cmd.js';
import { createServeStaticCommand } from './serve-static.cmd.js';

export function createServeCommand() {
  const serve = new Command('serve').description('serve resources');

  const serveApp = createServeAppCommand(serve);

  const serveStatic = createServeStaticCommand(serve);

  addPackageRelativePathArg([serveApp, serveStatic]);

  addPkgxCmdOptions([serveApp]);

  return serve;
}

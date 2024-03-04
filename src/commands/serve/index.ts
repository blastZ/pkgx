import { Command } from 'commander';

import { addPackageRelativePathArg, addPkgxCmdOptions } from '@/utils';

import { createServeAppCommand } from './serve-app.cmd.js';

export function createServeCommand() {
  const serve = new Command('serve').description('serve resources');

  const serveApp = createServeAppCommand(serve);

  addPackageRelativePathArg([serveApp]);

  addPkgxCmdOptions([serveApp]);

  return serve;
}

import { Command } from 'commander';

import { addPackageRelativePathArg, addPkgxCmdOptions } from '@/utils';

import { createBuildAppCommand } from './build-app.cmd.js';
import { createBuildNestNextCommand } from './build-nest-next.cmd.js';
import { createBuildPackageCommand } from './build-package.cmd.js';

export function createBuildCommand() {
  const build = new Command('build').description('build resources');

  const buildPackage = createBuildPackageCommand(build);

  const buildApp = createBuildAppCommand(build);

  const buildNestNext = createBuildNestNextCommand(build);

  addPackageRelativePathArg([buildPackage, buildApp, buildNestNext]);

  addPkgxCmdOptions([buildPackage, buildApp, buildNestNext]);

  return build;
}

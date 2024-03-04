import { Command } from 'commander';

import { addPackageRelativePathArg, addPkgxCmdOptions } from '@/utils';

import { createBuildNestNextCommand } from './build-nest-next.cmd.js';

export function createBuildCommand() {
  const build = new Command('build').description('build resources');

  const buildNestNext = createBuildNestNextCommand(build);

  addPackageRelativePathArg([buildNestNext]);

  addPkgxCmdOptions([buildNestNext]);

  return build;
}

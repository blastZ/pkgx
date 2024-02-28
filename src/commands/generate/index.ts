import { Command } from 'commander';

import { addPackageRelativePathArg } from '@/utils';

import { createGenerateConfigCommand } from './generate-config.cmd.js';
import { createGenerateDockerCommand } from './generate-docker.cmd.js';

export function createGenerateCommand() {
  const generate = new Command('generate')
    .alias('g')
    .description('generate resources');

  const generateConfig = createGenerateConfigCommand(generate);

  createGenerateDockerCommand(generate);

  addPackageRelativePathArg([generateConfig]);

  return generate;
}

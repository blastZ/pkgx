import { resolve } from 'node:path';

import { type Command } from 'commander';
import { cd } from 'zx';

import { ConfigGenerator } from '../../generators/config/generator.js';

async function generateConfig(pkgRelativePath: string) {
  const pkgPath = resolve(process.cwd(), pkgRelativePath);

  cd(pkgPath);

  const generator = new ConfigGenerator();

  await generator.generate();
}

export function createGenerateConfigCommand(generateCommand: Command) {
  const command = generateCommand
    .command('config')
    .description('generate config file')
    .action(generateConfig);

  return command;
}

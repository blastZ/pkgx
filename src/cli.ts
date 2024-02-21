#!/usr/bin/env node

import { program } from 'commander';

import {
  createBuildCommand,
  createServeCommand,
  generateConfigCommand,
  generateDockerCommand,
  publishCommand,
  replaceModuleSuffixCommand,
  testCommand,
} from '@/commands';
import {
  addPackageRelativePathArg,
  addPkgxCmdOptions,
  getCliVersion,
  logger,
} from '@/utils';

program.version(getCliVersion(), '-v --version');

program.addCommand(createBuildCommand());
program.addCommand(createServeCommand());

const test = program
  .command('test')
  .description('test package')
  .action(testCommand);

const publish = program
  .command('publish')
  .description('publish package')
  .action(publishCommand);

program
  .command('replace-module-suffix')
  .description('replace module suffix')
  .argument('<relative-path>', 'relative path to file or folder')
  .argument('<old-suffix>', 'old suffix')
  .argument('<new-suffix>', 'new suffix')
  .option('--index-dirs [indexDirs...]', 'replace suffix with index file path')
  .action(replaceModuleSuffixCommand);

const generate = program
  .command('generate')
  .alias('g')
  .description('generate resources');

const generateConfig = generate
  .command('config')
  .description('generate config file')
  .action(generateConfigCommand);

generate
  .command('docker')
  .description('generate docker file')
  .action(generateDockerCommand);

program.hook('preAction', () => {
  logger.logCliVersion();
});

addPackageRelativePathArg([test, publish, generateConfig]);

addPkgxCmdOptions([test, publish]);

program.configureOutput({
  writeErr: (str) => {
    if (str.startsWith('error: ')) {
      str = str.replace('error: ', '');
    }

    logger.error(str);
  },
});

program.parse();

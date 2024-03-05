#!/usr/bin/env node

import { program } from 'commander';
import { chalk } from 'zx';

import { logger } from '@libs/pkgx-plugin-devkit';

import {
  createBuildCommand,
  createGenerateCommand,
  createRunCommand,
  publishCommand,
  replaceModuleSuffixCommand,
  testCommand,
} from '@/commands';
import {
  addPackageRelativePathArg,
  addPkgxCmdOptions,
  getCliVersion,
  initZx,
} from '@/utils';

initZx();

program.version(getCliVersion(), '-v --version');

program.addCommand(createRunCommand(), { isDefault: true });
program.addCommand(createBuildCommand());
program.addCommand(createGenerateCommand());

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

program.hook('preAction', async () => {
  logger.info(chalk.underline(`v${getCliVersion()}`));
});

addPackageRelativePathArg([test, publish]);

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

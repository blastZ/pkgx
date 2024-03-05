#!/usr/bin/env node

import { program } from 'commander';
import { chalk } from 'zx';

import { logger } from '@libs/pkgx-plugin-devkit';

import {
  createGenerateCommand,
  createRunCommand,
  replaceModuleSuffixCommand,
} from '@/commands';
import { getCliVersion, initZx } from '@/utils';

initZx();

program.version(getCliVersion(), '-v --version');

program.addCommand(createRunCommand(), { isDefault: true });

program.addCommand(createGenerateCommand());

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

program.configureOutput({
  writeErr: (str) => {
    if (str.startsWith('error: ')) {
      str = str.replace('error: ', '');
    }

    logger.error(str);
  },
});

program.parse();

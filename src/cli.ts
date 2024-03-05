#!/usr/bin/env node

import { program } from 'commander';
import { chalk } from 'zx';

import { logger } from '@libs/pkgx-plugin-devkit';

import { createGenerateCommand, createRunCommand } from '@/commands';
import { getCliVersion, initZx } from '@/utils';

initZx();

program.version(getCliVersion(), '-v --version');

program.addCommand(createRunCommand(), { isDefault: true });

program.addCommand(createGenerateCommand());

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

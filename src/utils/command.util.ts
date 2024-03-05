import {
  Command as OriginCommand,
  program,
  type OutputConfiguration,
} from 'commander';
import { chalk } from 'zx';

import { logger } from '@libs/pkgx-plugin-devkit';

import { getCliVersion } from './get-cli-version.util.js';

const outputConfig: OutputConfiguration = {
  writeErr: (str) => {
    if (str.startsWith('error: ')) {
      str = str.replace('error: ', '');
    }

    if (str.startsWith('Error: ')) {
      str = str.replace('Error: ', '');
    }

    logger.error(str);
  },
};

export function initProgram() {
  program.version(getCliVersion(), '-v --version');

  program.hook('preAction', async () => {
    logger.info(chalk.underline(`v${getCliVersion()}`));
  });

  program.configureOutput(outputConfig);
}

export class Command extends OriginCommand {
  constructor(name: string) {
    super(name);

    this.configureOutput(outputConfig);
  }
}

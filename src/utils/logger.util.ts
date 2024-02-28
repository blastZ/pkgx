import ms from 'pretty-ms';
import { chalk } from 'zx';

import { Logger as OriginLogger } from '@libs/pkgx-plugin-devkit';

import { getCliVersion } from './get-cli-version.util.js';

class Logger extends OriginLogger {
  logCliVersion() {
    this.info(chalk.underline(`v${getCliVersion()}`));
  }

  logServeStaticRequest(method: string = 'GET', url: string = '/') {
    this.info(chalk.cyan(`${method} ${url}`));
  }

  logServeStaticTime(statusCode: number, time: number) {
    const str = `returned ${statusCode} in ${ms(time)}`;

    if (statusCode < 400) {
      return this.info(chalk.green(str));
    }

    return this.error(str);
  }
}

export const logger = new Logger();

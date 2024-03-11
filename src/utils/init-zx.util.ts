import { $, chalk, log, type LogEntry } from 'zx';

import { logger } from '@libs/pkgx-plugin-devkit';

process.env.FORCE_COLOR = '1';

function customLog(entry: LogEntry) {
  switch (entry.kind) {
    case 'cd':
      if (!$.verbose) return;

      logger.info(`${chalk.greenBright('cd')} ${entry.dir}`);

      break;

    default:
      log(entry);
  }
}

export function initZx() {
  $.log = customLog;
}

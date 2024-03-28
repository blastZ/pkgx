import { inspect } from 'util';

import { logger } from './logger.util.js';

export function printDiagnostics(...args: any[]) {
  if (process.env.PKGX_VERBOSE !== '1') {
    return;
  }

  logger.verbose(inspect(args, false, 10, true));
}

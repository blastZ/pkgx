import { inspect } from 'util';

import { logger } from './logger.util.js';

export function printDiagnostics(
  /**
   * @example '@pkgx/core'
   */
  scope: string,
  /**
   * @example ['commands', 'run.cmd.ts']
   */
  namespace: string[],
  diagnostics: Record<string, any>,
) {
  if (process.env.PKGX_VERBOSE !== '1') {
    return;
  }

  logger.verbose(scope, namespace, inspect(diagnostics, false, 10, true));
}

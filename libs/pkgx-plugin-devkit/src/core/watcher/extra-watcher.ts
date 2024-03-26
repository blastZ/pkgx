import { chalk } from 'zx';

import type { PkgxOptions } from '../../interfaces/pkgx-options.interface.js';
import { logger } from '../../utils/logger.util.js';
import { NodeProcessManager } from '../../utils/node-process-manager.js';

import { Watcher } from './watcher.js';

export class ExtraWatcher extends Watcher {
  constructor(options: Required<PkgxOptions>, child: NodeProcessManager) {
    super(options.watchExtra);

    this.onChange((path) => {
      logger.info(`(watcher) file ${chalk.cyan(path)} changed.`);

      child.reload();
    });
  }
}

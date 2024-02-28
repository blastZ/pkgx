import { ChildProcess, fork } from 'node:child_process';
import { clearTimeout } from 'node:timers';

import chokidar from 'chokidar';
import { watch, type RollupOptions } from 'rollup';

import { PkgxOptions } from '@/interfaces';
import { copyFiles, logger, parseAssets } from '@/utils';

import { getRollupOptions } from '../../utils/get-rollup-options.js';
import { handleError } from '../../utils/handle-error.js';
import { relativeId } from '../../utils/relative-id.js';

export class ServeExecutor {
  constructor(private pkgxOptions: Required<PkgxOptions>) {}

  startWatch(rollupOptions: RollupOptions[]) {
    let child: ChildProcess | null = null;
    let timer: NodeJS.Timeout | null = null;

    const startChild = () => {
      child = fork(`${this.pkgxOptions.outputDirName}/esm/index.js`, {
        execArgv: ['--enable-source-maps'],
      });

      child.on('close', (code, signal) => {
        timer && clearTimeout(timer);

        if (code !== null && code !== 0) {
          logger.warn(
            `process exited with code ${code}, waiting for changes to restart...`,
          );
        } else {
          startChild();
        }
      });

      child.on('error', (err) => {
        logger.error(err.message);
      });
    };

    const reloadChild = () => {
      if (child && child.exitCode === null) {
        child.kill('SIGTERM');

        timer = setTimeout(() => {
          if (child && child.exitCode === null) {
            logger.logForceRestart();

            child.kill('SIGKILL');
          }
        }, 5000);
      } else {
        startChild();
      }
    };

    const watcher = watch(rollupOptions);

    watcher.on('event', (event) => {
      switch (event.code) {
        case 'ERROR': {
          handleError(event.error, true);

          break;
        }

        case 'START': {
          // console.log(chalk.underline(`rollup v${rollup.VERSION}`));

          break;
        }

        case 'BUNDLE_START': {
          let input = event.input;

          if (typeof input !== 'string') {
            input = Array.isArray(input)
              ? input.join(', ')
              : Object.values(input as Record<string, string>).join(', ');
          }

          logger.logBundleInfo(input, event.output.map(relativeId).join(', '));

          break;
        }

        case 'BUNDLE_END': {
          logger.logBundleTime(
            event.output.map(relativeId).join(', '),
            event.duration,
          );

          break;
        }

        case 'END': {
          reloadChild();

          logger.logWaitingForChanges();
        }
      }

      if ('result' in event && event.result) {
        event.result.close().catch((error) => handleError(error, true));
      }
    });

    if (this.pkgxOptions.watchExtra.length > 0) {
      const extraWatcher = chokidar.watch(this.pkgxOptions.watchExtra);

      extraWatcher.on('change', (path) => {
        logger.logExtraWatcherChange(path);

        reloadChild();
      });
    }
  }

  async run() {
    const rollupOptions = getRollupOptions(this.pkgxOptions);

    this.startWatch(rollupOptions);

    await copyFiles(parseAssets(this.pkgxOptions));
  }
}

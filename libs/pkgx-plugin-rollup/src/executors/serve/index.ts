import { ChildProcess, fork } from 'node:child_process';
import { resolve } from 'node:path';
import { clearTimeout } from 'node:timers';

import chokidar from 'chokidar';
import { watch, type RollupOptions } from 'rollup';
import { $ } from 'zx';

import {
  changeWorkingDirectory,
  copyFiles,
  getFilledPkgxOptions,
  getPkgxConfigFileOptions,
  PackageType,
  PkgxContext,
  PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

import { getRollupOptions } from '../../utils/get-rollup-options.js';
import { handleError } from '../../utils/handle-error.js';
import { logger } from '../../utils/logger.util.js';
import { relativeId } from '../../utils/relative-id.js';

/**
 * Executor: @pkgx/rollup:serve
 */
export class ServeExecutor {
  constructor(private context: PkgxContext) {}

  startWatch(
    filledPkgxOptions: Required<PkgxOptions>,
    rollupOptions: RollupOptions[],
  ) {
    let child: ChildProcess | null = null;
    let timer: NodeJS.Timeout | null = null;

    const startFolder =
      filledPkgxOptions.packageType === PackageType.Module ? 'esm' : 'cjs';

    const startChild = () => {
      child = fork(
        `${filledPkgxOptions.outputDirName}/${startFolder}/index.js`,
        {
          execArgv: ['--enable-source-maps'],
          env: {
            ...process.env,
            APP_ENV: 'local',
            ...filledPkgxOptions.serveEnvs,
          },
        },
      );

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

    if (filledPkgxOptions.watchExtra.length > 0) {
      const extraWatcher = chokidar.watch(filledPkgxOptions.watchExtra);

      extraWatcher.on('change', (path) => {
        logger.logExtraWatcherChange(path);

        reloadChild();
      });
    }
  }

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const cmdOptions = this.context.cmdOptions;

    const pkgPath = resolve(process.cwd(), relativePath);

    await changeWorkingDirectory(pkgPath);

    const pkgxOptions = await getPkgxConfigFileOptions();

    const filledPkgxOptions = await getFilledPkgxOptions(
      { ...pkgxOptions, ...cmdOptions },
      { isServe: true },
    );

    await $`rm -rf ${filledPkgxOptions.outputDirName}`.quiet();

    const rollupOptions = await getRollupOptions(filledPkgxOptions);

    this.startWatch(filledPkgxOptions, rollupOptions);

    await copyFiles(filledPkgxOptions.assets, {
      destDir: filledPkgxOptions.outputDirName,
    });
  }
}

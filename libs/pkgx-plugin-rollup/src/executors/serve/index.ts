import { resolve } from 'node:path';

import { watch, type RollupOptions } from 'rollup';
import { $ } from 'zx';

import {
  changeWorkingDirectory,
  copyFiles,
  ExtraWatcher,
  getFilledPkgxOptions,
  getPkgxConfigFileOptions,
  NodeProcessManager,
  type PkgxContext,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

import { getRollupOptions } from '../../core/get-rollup-options.js';
import { handleError } from '../../core/handle-error.js';
import { logger } from '../../core/logger.js';
import { relativeId } from '../../core/relative-id.js';

export class ServeExecutor {
  constructor(private context: PkgxContext) {}

  startWatch(
    filledPkgxOptions: Required<PkgxOptions>,
    rollupOptions: RollupOptions[],
  ) {
    const child = new NodeProcessManager(filledPkgxOptions);

    new ExtraWatcher(filledPkgxOptions, child);

    const watcher = watch(rollupOptions);

    watcher.on('event', (event) => {
      switch (event.code) {
        case 'ERROR': {
          handleError(event.error, true);

          break;
        }

        case 'START': {
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
          child.reload();

          logger.logWaitingForChanges();
        }
      }

      if ('result' in event && event.result) {
        event.result.close().catch((error) => handleError(error, true));
      }
    });
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

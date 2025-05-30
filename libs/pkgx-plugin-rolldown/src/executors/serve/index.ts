import { resolve } from 'node:path';

import { watch, type RolldownOptions } from 'rolldown';
import { $ } from 'zx';

import {
  ExtraWatcher,
  NodeProcessManager,
  changeWorkingDirectory,
  copyFiles,
  getFilledPkgxOptions,
  readPkgxConfigFile,
  type PkgxContext,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';
import { handleError, logger, relativeId } from '@libs/pkgx-plugin-rollup';

import { getRolldownOptions } from '../../core/get-rolldown-options.js';

export class ServeExecutor {
  constructor(private context: PkgxContext) {}

  startWatch(
    filledPkgxOptions: Required<PkgxOptions>,
    rolldownOptions: RolldownOptions[],
  ) {
    const child = new NodeProcessManager(filledPkgxOptions);

    new ExtraWatcher(filledPkgxOptions, child);

    const watcher = watch(rolldownOptions);

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
          // let input = event.input;

          // if (typeof input !== 'string') {
          //   input = Array.isArray(input)
          //     ? input.join(', ')
          //     : Object.values(input as Record<string, string>).join(', ');
          // }

          // logger.logBundleInfo(input, event.output.map(relativeId).join(', '));

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
        event.result.close().catch((error: Error) => handleError(error, true));
      }
    });
  }

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const cmdOptions = this.context.cmdOptions;

    const pkgPath = resolve(process.cwd(), relativePath);

    await changeWorkingDirectory(pkgPath);

    const pkgxOptions = await readPkgxConfigFile();

    const filledPkgxOptions = await getFilledPkgxOptions(
      { ...pkgxOptions, ...cmdOptions },
      { isServe: true },
    );

    await $`rm -rf ${filledPkgxOptions.outputDirName}`.quiet();

    const rolldownOptions = await getRolldownOptions(filledPkgxOptions);

    this.startWatch(filledPkgxOptions, rolldownOptions);

    await copyFiles(filledPkgxOptions.assets, {
      destDir: filledPkgxOptions.outputDirName,
    });
  }
}

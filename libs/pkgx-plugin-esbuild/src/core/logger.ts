import dayjs from 'dayjs';
import type { BuildOptions } from 'esbuild';
import ms from 'pretty-ms';
import { chalk } from 'zx';

import { Logger as OriginLogger } from '@libs/pkgx-plugin-devkit';

const cyanBold = (msg: string) => chalk.cyan(chalk.bold(msg));
const greenBold = (msg: string) => chalk.green(chalk.bold(msg));

class Logger extends OriginLogger {
  logBundleInfo(options: BuildOptions) {
    const origin = (options.entryPoints as string[])[0];
    const target = options.outfile!;

    this.info(`${cyanBold(origin)} → ${cyanBold(target)}...`);
  }

  logBundleTime(id: string, time: number) {
    this.info(`created ${greenBold(id)} in ${greenBold(ms(time))}`);
  }

  logWaitingForChanges() {
    this.info(`(${dayjs().format()}) waiting for changes...`);
  }

  logExtraWatcherChange(path: string) {
    return this.info(`(watcher) file ${chalk.cyan(path)} changed.`);
  }
}

export const logger = new Logger();

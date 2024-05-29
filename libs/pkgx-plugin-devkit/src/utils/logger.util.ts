import { chalk } from 'zx';

const BASE_TAG = '[pkgx]';

const INFO_TAG = chalk.cyan(BASE_TAG);
const WARNING_TAG = chalk.yellow(BASE_TAG);
const ERROR_TAG = chalk.red(BASE_TAG);
const VERBOSE_TAG = chalk.magenta('[pkgx::diagnostics]');

export class Logger {
  private write(msg: string) {
    process.stderr.write(msg + '\n');
  }

  info(msg: string) {
    this.write(`${INFO_TAG} ${msg}`);
  }

  warn(msg: string) {
    this.write(`${WARNING_TAG} ${msg}`);
  }

  error(msg: string) {
    this.write(`${ERROR_TAG} ${chalk.red(msg)}`);
  }

  verbose(scope: string, namespace: string[], msg: string) {
    this.write(
      `${VERBOSE_TAG} ${chalk.blue(scope)} → ${namespace.join('/')}\n${msg}`,
    );
  }
}

export const logger = new Logger();

import { createServer } from 'node:http';

import ms from 'pretty-ms';
import handler from 'serve-handler';
import { chalk } from 'zx';

import { PkgxContext, logger } from '@libs/pkgx-plugin-devkit';

import { ServeStaticOptions } from './serve-static-options.interface.js';

export class ServeStaticExecutor {
  constructor(private ctx: PkgxContext<ServeStaticOptions>) {}

  private logServeStaticRequest(method: string = 'GET', url: string = '/') {
    logger.info(chalk.cyan(`${method} ${url}`));
  }

  private logServeStaticTime(statusCode: number, time: number) {
    const str = `returned ${statusCode} in ${ms(time)}`;

    if (statusCode < 400) {
      return logger.info(chalk.green(str));
    }

    return logger.error(str);
  }

  async serve() {
    const { cmdOptions, cmdArguments } = this.ctx;

    const [relativePath] = cmdArguments;

    if (!relativePath) {
      throw new Error('Invalid relative path');
    }

    const server = createServer(async (request, response) => {
      const start = Date.now();

      this.logServeStaticRequest(request.method, request.url);

      if (cmdOptions.cors) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Headers', '*');
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Allow-Private-Network', 'true');
      }

      await handler(request, response, {
        public: relativePath,
      });

      this.logServeStaticTime(response.statusCode, Date.now() - start);
    });

    const port = Number(cmdOptions.port || 80);

    server.listen(port, () => {
      logger.info(`running at port ${port}`);
    });
  }

  async run() {
    await this.serve();
  }
}

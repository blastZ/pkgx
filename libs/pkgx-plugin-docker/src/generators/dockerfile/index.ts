import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { $, chalk } from 'zx';

import { __dirname, logger } from '@libs/pkgx-plugin-devkit';

export class DockerfileGenerator {
  async checkDockerfileExists() {
    const filesInDirectory = new Set(await readdir(process.cwd()));

    if (filesInDirectory.has('Dockerfile')) {
      throw new Error('Dockerfile already exists');
    }
  }

  async run() {
    await this.checkDockerfileExists();

    await $`cp ${resolve(
      __dirname,
      '../templates/pkgx.Dockerfile',
    )} ./Dockerfile`.quiet();

    logger.info(chalk.green(`create Dockerfile successfully`));
  }
}

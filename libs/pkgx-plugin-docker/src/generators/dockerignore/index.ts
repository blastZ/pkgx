import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { $, chalk } from 'zx';

import { __dirname, logger } from '@libs/pkgx-plugin-devkit';

export class DockerignoreGenerator {
  async checkDockerignoreExists() {
    const filesInDirectory = new Set(await readdir(process.cwd()));

    if (filesInDirectory.has('.dockerignore')) {
      throw new Error('.dockerignore already exists');
    }
  }

  async run() {
    await this.checkDockerignoreExists();

    await $`cp ${resolve(
      __dirname,
      '../templates/pkgx.Dockerfile.dockerignore',
    )} ./.dockerignore`.quiet();

    logger.info(chalk.green(`create .dockerignore successfully`));
  }
}

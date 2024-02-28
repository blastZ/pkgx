import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { program } from 'commander';
import { $, chalk } from 'zx';

import { __dirname, logger } from '@libs/pkgx-plugin-devkit';

/**
 * Generator: @pkgx/docker:dockerfile
 */
export class DockerfileGenerator {
  async checkDockerfileExists() {
    const filesInDirectory = new Set(await readdir(process.cwd()));

    if (filesInDirectory.has('Dockerfile')) {
      throw program.error('Dockerfile already exists');
    }
  }

  async run() {
    await this.checkDockerfileExists();

    await $`cp ${resolve(
      __dirname,
      '../libs/pkgx-plugin-docker/templates/pkgx.Dockerfile',
    )} ./Dockerfile`.quiet();

    logger.info(chalk.green(`create Dockerfile successfully`));
  }
}

import { readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import dayjs from 'dayjs';
import { $, chalk } from 'zx';

import {
  PkgxContext,
  __dirname,
  getPkgJson,
  logger,
} from '@libs/pkgx-plugin-devkit';

import { BuildImageOptions } from './build-image-options.interface.js';

export class BuildExecutor {
  constructor(private context: PkgxContext<BuildImageOptions>) {}

  async getTag() {
    const date = dayjs(new Date()).format('YYYYMMDD');
    const commit = (await $`git log -n 1 --pretty=%h`.quiet()).toString();

    return `${date}-${commit.trim()}`;
  }

  async build() {
    const [relativePath] = this.context.cmdArguments;
    const options = this.context.cmdOptions;

    const rootDir = process.cwd();
    const pkgDir = resolve(rootDir, relativePath);

    const filesInDirectory = new Set(await readdir(rootDir));

    let pkgxDockerfile = false;

    if (!filesInDirectory.has('Dockerfile')) {
      pkgxDockerfile = true;

      logger.info('Dockerfile not found, use pkgx.Dockerfile');
    }

    const pkgJson = await getPkgJson(pkgDir);

    const appName = pkgJson.name;
    const appFolder = basename(pkgDir);

    const host = options.host || 'docker.io';
    const namespace = options.namespace || 'library';
    const repo = options.repo || appName;
    const progressType = options.progress || options.debug ? 'plain' : 'auto';
    const targetStage = options.target || 'prod';
    const tag = await this.getTag();

    const imageName = `${repo}:${tag}`;
    const fullImageName = `${host}/${namespace}/${imageName}`;

    const flags = [
      '-t',
      imageName,
      '--target',
      targetStage,
      '--build-arg',
      `APP_NAME=${appName}`,
      '--build-arg',
      `APP_FOLDER=${appFolder}`,
      '--progress',
      progressType,
    ];

    if (pkgxDockerfile) {
      flags.push('-f', resolve(__dirname, '../templates/pkgx.Dockerfile'));
    }

    if (options.debug || !options.cache) {
      flags.push('--no-cache');
    }

    if (options.dryRun) {
      logger.info(
        'below command will be executed by docker:\n\n' +
          chalk.cyan(`docker build . ${flags.join(' ')}`) +
          '\n',
      );
    } else {
      await $`docker build . ${flags}`;

      await $`docker tag ${imageName} ${fullImageName}`.quiet();
    }

    const suggestedCommands = [`docker push ${fullImageName}`];

    logger.info(
      `build image success, try below commands` +
        '\n\n' +
        suggestedCommands.map((cmd) => chalk.cyan(cmd)).join('\n') +
        '\n',
    );
  }

  async run() {
    await this.build();
  }
}
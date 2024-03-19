import { readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import { select } from '@inquirer/prompts';
import dayjs from 'dayjs';
import { $, chalk } from 'zx';

import {
  PkgxContext,
  __dirname,
  logger,
  readPackageJsonFile,
  readPkgxWorkspaceConfigFile,
} from '@libs/pkgx-plugin-devkit';

import { BuildImageOptions } from './interfaces/build-image-options.interface.js';
import { PluginOptions } from './interfaces/plugin-options.interface.js';

export class BuildExecutor {
  private pluginOptions: PluginOptions | undefined;

  constructor(private context: PkgxContext<BuildImageOptions>) {}

  async getTag() {
    const date = dayjs(new Date()).format('YYYYMMDD');
    const commit = (await $`git log -n 1 --pretty=%h`.quiet()).toString();

    return `${date}-${commit.trim()}`;
  }

  private async getPluginOptions() {
    if (this.pluginOptions) {
      return this.pluginOptions;
    }

    const pkgxWorkspaceOptions = await readPkgxWorkspaceConfigFile();
    const pluginOptions = pkgxWorkspaceOptions?.plugins?.['@pkgx/docker'];

    this.pluginOptions = pluginOptions;

    return this.pluginOptions;
  }

  private async getNamespace(hostUrl: string) {
    const DEFAULT = 'library';

    if (this.context.cmdOptions.namespace) {
      return this.context.cmdOptions.namespace;
    }

    const pluginOptions = await this.getPluginOptions();

    if (!pluginOptions || !pluginOptions.hosts) {
      return DEFAULT;
    }

    const hosts = pluginOptions.hosts;

    const hostKey = Object.keys(hosts).find((k) => hosts[k].url === hostUrl);

    if (!hostKey) {
      return DEFAULT;
    }

    const namespaces = pluginOptions.hosts[hostKey].namespaces;

    if (!namespaces || Object.keys(namespaces).length < 1) {
      return DEFAULT;
    }

    const namespace = await select({
      message: 'Select a namespace',
      choices: Object.keys(namespaces).map((k) => ({
        name: k,
        value: k,
      })),
    }).catch(() => {
      throw new Error('No namespace selected');
    });

    return namespaces[namespace];
  }

  private async getHost() {
    if (this.context.cmdOptions.host) {
      return this.context.cmdOptions.host;
    }

    const pluginOptions = await this.getPluginOptions();

    if (
      !pluginOptions ||
      !pluginOptions.hosts ||
      Object.keys(pluginOptions.hosts).length < 1
    ) {
      return 'docker.io';
    }

    const hosts = pluginOptions.hosts;

    const host = await select({
      message: 'Select a host',
      choices: Object.keys(hosts).map((k) => ({
        name: k,
        value: k,
      })),
    }).catch(() => {
      throw new Error('No host selected');
    });

    return hosts[host].url;
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

    const pkgJson = await readPackageJsonFile(
      resolve(pkgDir, './package.json'),
    );

    const appName = pkgJson?.name || basename(pkgDir);
    const appFolder = basename(pkgDir);

    const host = await this.getHost();
    const namespace = await this.getNamespace(host);
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

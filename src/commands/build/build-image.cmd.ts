import { readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import { type Command } from 'commander';
import dayjs from 'dayjs';
import { $, chalk } from 'zx';

import { __dirname, getPkgJson } from '@libs/pkgx-plugin-devkit';

import { CmdBuildImageOptions } from '@/interfaces';
import { logger } from '@/utils';

async function getTag() {
  const date = dayjs(new Date()).format('YYYYMMDD');
  const commit = (await $`git log -n 1 --pretty=%h`.quiet()).toString();

  return `${date}-${commit.trim()}`;
}

async function build(pkgRelativePath: string, options: CmdBuildImageOptions) {
  const rootDir = process.cwd();
  const pkgDir = resolve(rootDir, pkgRelativePath);

  const filesInDirectory = new Set(await readdir(rootDir));

  let pkgxDockerfile = false;

  if (!filesInDirectory.has('Dockerfile')) {
    pkgxDockerfile = true;

    logger.info('Dockerfile not found, use pkgx.Dockerfile');
  }

  const pkgJson = getPkgJson(pkgDir);

  const appName = pkgJson.name;
  const appFolder = basename(pkgDir);

  const host = options.host || 'docker.io';
  const namespace = options.namespace || 'library';
  const repo = options.repo || appName;
  const progressType = options.progress || options.debug ? 'plain' : 'auto';
  const targetStage = options.target || 'prod';
  const tag = await getTag();

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
    flags.push(
      '-f',
      resolve(
        __dirname,
        '../libs/pkgx-plugin-docker/templates/pkgx.Dockerfile',
      ),
    );
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

async function buildImage(
  pkgRelativePath: string,
  options: CmdBuildImageOptions,
) {
  await build(pkgRelativePath, options);
}

export function createBuildImageCommand(buildCommand: Command) {
  const command = buildCommand
    .command('image')
    .description('build image')
    .option('--host <host>', 'host name')
    .option('--namespace <namespace>', 'namespace')
    .option('--repo <repo>', 'repo')
    .option(
      '--progress <progress>',
      'type of progress output (auto, plain, tty). Use plain to show container output (default "auto")',
    )
    .option('--no-cache', 'do not use cache when building the image')
    .option('--target <target>', 'set target build stage to build')
    .option('--debug', 'debug mode, set progress to plain and no-cache to true')
    .option('--dry-run', 'dry run')
    .action(buildImage);

  return command;
}

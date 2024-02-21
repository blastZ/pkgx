import { resolve } from 'node:path';

import { type Command } from 'commander';
import { $ } from 'zx';

import { changeWorkingDirectory, getPkgxOptions } from '@/utils';

async function build(pkgRelativePath: string) {
  await changeWorkingDirectory(pkgRelativePath);

  const pkgxOptions = await getPkgxOptions();

  const nextDirPath = resolve(pkgxOptions.inputDir, 'next');
  const dotNextDirPath = resolve(nextDirPath, '.next');

  const outputNextDirPath = resolve(pkgxOptions.outputDirName, 'next');
  const outputDotNextDirPath = resolve(outputNextDirPath, '.next');

  await $`rm -rf ${dotNextDirPath}`.quiet();

  await $`pnpm next build ${nextDirPath}`;

  await $`rm -rf ${outputNextDirPath}`.quiet();

  await $`mkdir -p ${outputNextDirPath}`.quiet();

  await $`mv ${dotNextDirPath} ${outputNextDirPath}`.quiet();

  await $`rm -rf ${outputDotNextDirPath}/cache`.quiet();
}

async function buildNestNext(pkgRelativePath: string) {
  await build(pkgRelativePath);
}

export function createBuildNestNextCommand(buildCommand: Command) {
  const command = buildCommand
    .command('nest-next')
    .description('build next in nest application')
    .action(buildNestNext);

  return command;
}

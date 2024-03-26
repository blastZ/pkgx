import { context } from 'esbuild';
import { $ } from 'zx';

import {
  ExtraWatcher,
  NodeProcessManager,
  changeWorkingDirectory,
  copyFiles,
  getFilledPkgxOptions,
  getPkgxConfigFileOptions,
  type PkgxCmdOptions,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';

import { getEsbuildOptions } from '../../core/get-esbuild-options.js';
import { logger } from '../../core/logger.js';

export class ServeExecutor {
  constructor(private context: PkgxContext<PkgxCmdOptions>) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const cmdOptions = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await getPkgxConfigFileOptions();

    const filledPkgxOptions = await getFilledPkgxOptions(
      { ...pkgxOptions, ...cmdOptions },
      { isServe: true },
    );

    const outputDirName = filledPkgxOptions.outputDirName;

    await $`rm -rf ${outputDirName}`.quiet();

    const esbuildOptions = await getEsbuildOptions(filledPkgxOptions);

    const serveOptions = esbuildOptions[0];

    if (!serveOptions.plugins) {
      serveOptions.plugins = [];
    }

    const child = new NodeProcessManager(filledPkgxOptions);

    new ExtraWatcher(filledPkgxOptions, child);

    serveOptions.plugins.push({
      name: 'serve',
      setup(build) {
        let start: number;

        build.onStart(() => {
          logger.logBundleInfo(serveOptions);

          start = Date.now();
        });

        build.onEnd(() => {
          const time = Date.now() - start;

          logger.logBundleTime(serveOptions.outfile!, time);

          child.reload();

          logger.logWaitingForChanges();
        });
      },
    });

    const ctx = await context(serveOptions);

    await ctx.watch();

    await copyFiles(filledPkgxOptions.assets, {
      destDir: filledPkgxOptions.outputDirName,
    });
  }
}

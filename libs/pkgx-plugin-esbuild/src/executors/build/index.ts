import { build } from 'esbuild';
import ms from 'pretty-ms';
import { chalk } from 'zx';

import {
  InternalOptions,
  NpmHelper,
  PkgxOptions,
  copyFiles,
  getFilledPkgxOptions,
  logger,
} from '@libs/pkgx-plugin-devkit';

import { getEsbuildOptions } from '../../core/get-esbuild-options.js';

const cyanBold = (msg: string) => chalk.cyan(chalk.bold(msg));
const greenBold = (msg: string) => chalk.green(chalk.bold(msg));

export class BuildExecutor {
  private filledPkgxOptions: Required<PkgxOptions> | undefined;

  constructor(
    private pkgxOptions: PkgxOptions,
    private internalOptions: InternalOptions = {},
  ) {}

  async getFilledPkgxOptions() {
    if (!this.filledPkgxOptions) {
      this.filledPkgxOptions = await getFilledPkgxOptions(
        this.pkgxOptions,
        this.internalOptions,
      );
    }

    return this.filledPkgxOptions;
  }

  async run() {
    const filledOptions = await this.getFilledPkgxOptions();

    const esbuildOptions = await getEsbuildOptions(filledOptions);

    await Promise.all(
      esbuildOptions.map(async (options) => {
        const input = (options.entryPoints as string[])[0];
        const output = options.outfile!;

        logger.info(`${cyanBold(input)} → ${cyanBold(output)}...`);

        const start = Date.now();

        await build(options);

        const time = Date.now() - start;

        logger.info(`created ${greenBold(output)} in ${greenBold(ms(time))}`);
      }),
    );

    await new NpmHelper(process.cwd(), filledOptions).generatePackageFiles();

    await copyFiles(filledOptions.assets, {
      destDir: filledOptions.outputDirName,
    });
  }
}

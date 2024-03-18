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

    const outputDir = `${filledOptions.outputDirName}/esm`;

    const input = `${filledOptions.inputDir}/${filledOptions.esmInputFileName}`;
    const output = `${outputDir}/index.js`;

    logger.info(`${cyanBold(input)} → ${cyanBold(output)}...`);

    const start = Date.now();

    await build({
      entryPoints: [input],
      bundle: true,
      outfile: output,
      format: filledOptions.disableEsmOutput ? 'cjs' : 'esm',
      packages: 'external',
      // esbuild must explicitly set working directory
      absWorkingDir: process.cwd(),
    });

    const time = Date.now() - start;

    logger.info(`created ${greenBold(output)} in ${greenBold(ms(time))}`);

    await new NpmHelper(process.cwd(), filledOptions).generatePackageFiles();

    await copyFiles(filledOptions.assets, {
      destDir: filledOptions.outputDirName,
    });
  }
}

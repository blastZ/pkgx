import { rollup, type RollupBuild, type RollupOptions } from 'rollup';

import {
  OutputType,
  changeWorkingDirectory,
  getFilledPkgxOptions,
  readPkgxConfigFile,
  type PkgxCmdOptions,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';

import { getGraphOutput } from '../../core/get-graph-output.js';
import { handleError } from '../../core/handle-error.js';

export class GraphExecutor {
  constructor(private context: PkgxContext<PkgxCmdOptions>) {}

  async startBundle(options: RollupOptions) {
    let bundle: RollupBuild | undefined;
    try {
      bundle = await rollup(options);

      await bundle.generate({});
    } catch (err: any) {
      handleError(err);
    } finally {
      if (bundle) {
        await bundle.close();
      }
    }
  }

  async run() {
    const [relativePath] = this.context.cmdArguments;
    const options = this.context.cmdOptions;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await readPkgxConfigFile();

    const filledOptions = await getFilledPkgxOptions(pkgxOptions);

    await this.startBundle(await getGraphOutput(OutputType.ESM, filledOptions));
  }
}

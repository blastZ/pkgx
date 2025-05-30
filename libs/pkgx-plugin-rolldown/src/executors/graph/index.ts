import { rolldown, type RolldownBuild, type RolldownOptions } from 'rolldown';

import {
  changeWorkingDirectory,
  getFilledPkgxOptions,
  OutputType,
  readPkgxConfigFile,
  type PkgxCmdOptions,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';
import { handleError } from '@libs/pkgx-plugin-rollup';

import { getGraphOutput } from '../../core/get-graph-output.js';

export class GraphExecutor {
  constructor(private context: PkgxContext<PkgxCmdOptions>) {}

  async startBundle(options: RolldownOptions) {
    let bundle: RolldownBuild | undefined;
    try {
      bundle = await rolldown(options);

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

    const filledOptions = await getFilledPkgxOptions({
      ...pkgxOptions,
      ...options,
    });

    await this.startBundle(await getGraphOutput(OutputType.ESM, filledOptions));
  }
}

import { $ } from 'zx';

import {
  PkgxContext,
  changeWorkingDirectory,
  getFilledPkgxOptions,
  getPkgxConfigFileOptions,
} from '@libs/pkgx-plugin-devkit';

export class PublishExecutor {
  constructor(private context: PkgxContext) {}

  async run() {
    const [relativePath] = this.context.cmdArguments;

    await changeWorkingDirectory(relativePath);

    const pkgxOptions = await getPkgxConfigFileOptions();
    const filledPkgxOptions = await getFilledPkgxOptions(pkgxOptions);

    await changeWorkingDirectory(filledPkgxOptions.outputDirName);

    await $`npm publish --access public --registry=https://registry.npmjs.org`;
  }
}

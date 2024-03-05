import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

import { getPkgJson, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { CJS_TEMPLATE } from '../../constants/cjs-template.constant.js';

export class CjsPackageJsonFileGenerator {
  constructor(private pkgxOptions: Required<PkgxOptions>) {}

  async run() {
    const pkgJson = await getPkgJson();

    const templatePkgJson = CJS_TEMPLATE;

    let str = JSON.stringify(templatePkgJson, null, 2);

    str = str.replace('REPLACE_WITH_PACKAGE_NAME', pkgJson.name);

    if (existsSync(`./${this.pkgxOptions.outputDirName}/cjs`)) {
      await writeFile(
        `./${this.pkgxOptions.outputDirName}/cjs/package.json`,
        str,
      );
    }
  }
}

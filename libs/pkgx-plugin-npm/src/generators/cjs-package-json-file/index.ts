import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

import { getPkgJson } from '@libs/pkgx-common';

import { PkgxOptions } from '@/interfaces';

import { CJS_TEMPLATE } from '../../constants/cjs-template.constant.js';

/**
 * Generator: @pkgx/npm:cjs-package-json-file
 */
export class CjsPackageJsonFileGenerator {
  constructor(private options: Required<PkgxOptions>) {}

  async run() {
    const pkgJson = getPkgJson();

    const templatePkgJson = CJS_TEMPLATE;

    let str = JSON.stringify(templatePkgJson, null, 2);

    str = str.replace('REPLACE_WITH_PACKAGE_NAME', pkgJson.name);

    if (existsSync(`./${this.options.outputDirName}/cjs`)) {
      await writeFile(`./${this.options.outputDirName}/cjs/package.json`, str);
    }
  }
}

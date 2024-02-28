import { writeFile } from 'node:fs/promises';

import { getPkgJson, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { ESM_TEMPLATE } from '../../constants/esm-template.constant.js';
import { fixDependencies } from '../../utils/fix-denpendencies.util.js';

/**
 * Generator: @pkgx/npm:package-json-file
 */
export class PackageJsonFileGenerator {
  constructor(private pkgxOptions: Required<PkgxOptions>) {}

  async run() {
    const pkgJson = getPkgJson();

    const templatePkgJson = ESM_TEMPLATE;

    if (
      !pkgJson.repository ||
      !pkgJson.repository.type ||
      !pkgJson.repository.url
    ) {
      templatePkgJson.repository = undefined;
    }

    templatePkgJson.dependencies = fixDependencies(
      this.pkgxOptions,
      pkgJson.dependencies || {},
    );
    templatePkgJson.peerDependencies = fixDependencies(
      this.pkgxOptions,
      pkgJson.peerDependencies || {},
    );

    templatePkgJson.scripts = {
      ...templatePkgJson.scripts,
      ...(this.pkgxOptions.addStartScript
        ? {
            start: 'node esm/index.js',
          }
        : {}),
      ...this.pkgxOptions.customScripts,
    };

    if (Object.keys(templatePkgJson.scripts).length < 1) {
      templatePkgJson.scripts = undefined;
    }

    if (this.pkgxOptions.cliInputFileName) {
      templatePkgJson.bin = {
        [pkgJson.name.includes('@')
          ? pkgJson.name.split('/')[1]
          : pkgJson.name]: './bin/index.js',
      };
    }

    let str = JSON.stringify(templatePkgJson, null, 2);

    str = str
      .replace('REPLACE_WITH_PACKAGE_NAME', pkgJson.name)
      .replace('REPLACE_WITH_PACKAGE_VERSION', pkgJson.version || '1.0.0')
      .replace('REPLACE_WITH_PACKAGE_DESCRIPTION', pkgJson.description || '')
      .replace('REPLACE_WITH_PACKAGE_HOMEPAGE', pkgJson.homepage || '')
      .replace(
        'REPLACE_WITH_PACKAGE_REPOSITORY_TYPE',
        pkgJson.repository?.type || '',
      )
      .replace(
        'REPLACE_WITH_PACKAGE_REPOSITORY_URL',
        pkgJson.repository?.url || '',
      )
      .replace('REPLACE_WITH_PACKAGE_AUTHOR', pkgJson.author || '')
      .replace('REPLACE_WITH_PACKAGE_LICENSE', pkgJson.license || 'ISC');

    await writeFile(`./${this.pkgxOptions.outputDirName}/package.json`, str);
  }
}

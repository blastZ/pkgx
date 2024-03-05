import { writeFile } from 'node:fs/promises';

import { getPkgJson, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

import { ESM_TEMPLATE } from '../../constants/esm-template.constant.js';

export class PackageJsonFileGenerator {
  constructor(private pkgxOptions: Required<PkgxOptions>) {}

  fixDependencies(originDependencies: Record<string, string>) {
    const targetDependencies: Record<string, string> = {};

    Object.keys(originDependencies).map((key) => {
      if (this.pkgxOptions.excludeFromExternal.includes(key)) {
        // do noting
      } else {
        targetDependencies[key] = originDependencies[key];
      }
    });

    if (Object.keys(targetDependencies).length < 1) {
      return undefined;
    }

    return targetDependencies;
  }

  async run() {
    const pkgJson = await getPkgJson();

    const templatePkgJson = ESM_TEMPLATE;

    if (
      !pkgJson.repository ||
      !pkgJson.repository.type ||
      !pkgJson.repository.url
    ) {
      templatePkgJson.repository = undefined;
    }

    templatePkgJson.dependencies = this.fixDependencies(
      pkgJson.dependencies || {},
    );
    templatePkgJson.peerDependencies = this.fixDependencies(
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

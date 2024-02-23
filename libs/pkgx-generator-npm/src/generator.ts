import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

import { getPkgJson } from '@libs/pkgx-common';

import { PkgxOptions } from '@/interfaces';

import { CJS_TEMPLATE } from './constants/cjs-template.constant.js';
import { ESM_TEMPLATE } from './constants/esm-template.constant.js';

export class NpmGenerator {
  constructor(private options: Required<PkgxOptions>) {}

  getDependencies(originDependencies: Record<string, string>) {
    const targetDependencies: Record<string, string> = {};

    Object.keys(originDependencies).map((key) => {
      if (this.options.excludeFromExternal.includes(key)) {
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

  async generatePackageJsonFile() {
    const pkgJson = getPkgJson();

    const templatePkgJson = ESM_TEMPLATE;

    if (
      !pkgJson.repository ||
      !pkgJson.repository.type ||
      !pkgJson.repository.url
    ) {
      templatePkgJson.repository = undefined;
    }

    templatePkgJson.dependencies = this.getDependencies(
      pkgJson.dependencies || {},
    );
    templatePkgJson.peerDependencies = this.getDependencies(
      pkgJson.peerDependencies || {},
    );

    templatePkgJson.scripts = {
      ...templatePkgJson.scripts,
      ...(this.options.addStartScript
        ? {
            start: 'node esm/index.js',
          }
        : {}),
      ...this.options.customScripts,
    };

    if (Object.keys(templatePkgJson.scripts).length < 1) {
      templatePkgJson.scripts = undefined;
    }

    if (this.options.cliInputFileName) {
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

    await writeFile(`./${this.options.outputDirName}/package.json`, str);
  }

  async generateCjsPackageJsonFile() {
    const pkgJson = getPkgJson();

    const templatePkgJson = CJS_TEMPLATE;

    let str = JSON.stringify(templatePkgJson, null, 2);

    str = str.replace('REPLACE_WITH_PACKAGE_NAME', pkgJson.name);

    if (existsSync(`./${this.options.outputDirName}/cjs`)) {
      await writeFile(`./${this.options.outputDirName}/cjs/package.json`, str);
    }
  }
}

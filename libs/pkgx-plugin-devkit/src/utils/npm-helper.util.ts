import { writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

import { PackageType } from '../enums/package-type.enum.js';
import type { PkgJson } from '../interfaces/pkg-json.interface.js';
import type { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getPackageType } from './get-package-type.util.js';
import { isPathAvailable } from './is-path-available.util.js';
import { parsePackageJsonPaths } from './parse-package-json-paths.util.js';
import { readPackageJsonFile } from './read-package-json-file.util.js';

const DEFAULT_PACKAGE_NAME = 'anonymous';

const MODULE_TEMPLATE: PkgJson = {
  name: DEFAULT_PACKAGE_NAME,
  type: 'module',
  main: './cjs/index.js',
  exports: {
    types: './index.d.ts',
    require: './cjs/index.js',
    import: './esm/index.js',
  },
  types: './index.d.ts',
};

const MODULE_CJS_TEMPLATE: PkgJson = {
  name: '',
  type: 'commonjs',
};

const CJS_TEMPLATE: PkgJson = {
  name: '',
  main: './cjs/index.js',
  types: './index.d.ts',
};

export class NpmHelper {
  private template: PkgJson = { name: '' };
  private initialized = false;
  private isWsp = false;
  private pkgJson: PkgJson | undefined;
  private wspPkgJson: PkgJson | undefined;
  private packageType: PackageType = PackageType.Module;

  constructor(
    private cwd: string,
    private pkgxOptions: Required<PkgxOptions>,
  ) {}

  private async init() {
    const parseResult = await parsePackageJsonPaths(this.cwd);

    this.isWsp = parseResult.isWsp;

    this.pkgJson = await readPackageJsonFile(parseResult.pkgJsonPath);
    this.wspPkgJson = this.isWsp
      ? await readPackageJsonFile(parseResult.wspPkgJsonPath)
      : undefined;

    this.packageType = await getPackageType(parseResult);
    this.template =
      this.packageType === PackageType.Module ? MODULE_TEMPLATE : CJS_TEMPLATE;

    this.initialized = true;
  }

  private fixRepository() {
    if (
      this.pkgJson &&
      this.pkgJson.repository &&
      this.pkgJson.repository.type &&
      this.pkgJson.repository.url
    ) {
      this.template.repository = {
        type: this.pkgJson.repository.type,
        url: this.pkgJson.repository.url,
      };

      return this;
    }

    if (
      this.wspPkgJson &&
      this.wspPkgJson.repository &&
      this.wspPkgJson.repository.type &&
      this.wspPkgJson.repository.url
    ) {
      this.template.repository = {
        type: this.wspPkgJson.repository.type,
        url: this.wspPkgJson.repository.url,
      };

      return this;
    }

    return this;
  }

  private fixDependencies() {
    const isPackageBased =
      this.pkgJson?.dependencies || this.pkgJson?.peerDependencies;

    const originDependencies = isPackageBased
      ? this.pkgJson?.dependencies || {}
      : this.wspPkgJson?.dependencies || {};

    const originPeerDependencies = isPackageBased
      ? this.pkgJson?.peerDependencies || {}
      : this.wspPkgJson?.peerDependencies || {};

    Object.keys(originDependencies).map((key) => {
      if (this.pkgxOptions.excludeFromExternal.includes(key)) {
        // do noting
      } else if (
        this.packageType === PackageType.Commonjs &&
        this.pkgxOptions.cjsExcludeFromExternal.includes(key)
      ) {
        // do noting
      } else {
        if (!this.template.dependencies) {
          this.template.dependencies = {};
        }

        this.template.dependencies[key] = originDependencies[key];
      }
    });

    Object.keys(originPeerDependencies).map((key) => {
      if (this.pkgxOptions.excludeFromExternal.includes(key)) {
        // do noting
      } else if (
        this.packageType === PackageType.Commonjs &&
        this.pkgxOptions.cjsExcludeFromExternal.includes(key)
      ) {
        // do noting
      } else {
        if (!this.template.peerDependencies) {
          this.template.peerDependencies = {};
        }

        this.template.peerDependencies[key] = originPeerDependencies[key];
      }
    });

    return this;
  }

  private fixScripts() {
    const scripts = {
      ...this.template.scripts,
      ...(this.pkgxOptions.addStartScript
        ? {
            start:
              this.packageType === PackageType.Module
                ? 'node esm/index.js'
                : 'node cjs/index.js',
          }
        : {}),
      ...this.pkgxOptions.customScripts,
    };

    if (Object.keys(scripts).length > 0) {
      this.template.scripts = scripts;
    }

    return this;
  }

  private fixName() {
    this.template.name = this.pkgJson?.name || basename(this.cwd);

    return this;
  }

  private fixCommonAttributes() {
    if (
      this.packageType === PackageType.Module &&
      this.pkgxOptions.disableCjsOutput
    ) {
      delete this.template.exports;

      this.template.main = './esm/index.js';
    }

    this.template.version =
      this.pkgJson?.version || this.wspPkgJson?.version || '1.0.0';

    this.template.description = this.pkgJson?.description || '';

    this.template.homepage =
      this.pkgJson?.homepage || this.wspPkgJson?.homepage || '';

    this.template.author =
      this.pkgJson?.author || this.wspPkgJson?.author || '';

    this.template.license =
      this.pkgJson?.license || this.wspPkgJson?.license || 'ISC';

    return this;
  }

  private fixCli() {
    if (this.pkgxOptions.cliInputFileName) {
      const name = this.pkgJson?.name || DEFAULT_PACKAGE_NAME;

      this.template.bin = {
        [name.includes('@') ? name.split('/')[1] : name]: './bin/index.js',
      };
    }

    return this;
  }

  private async writeModuleCjsTemplate() {
    const template = MODULE_CJS_TEMPLATE;

    template.name = this.template.name;

    const cjsDir = `./${this.pkgxOptions.outputDirName}/cjs`;

    if (await isPathAvailable(cjsDir)) {
      await writeFile(
        `${cjsDir}/package.json`,
        JSON.stringify(template, null, 2),
      );
    }
  }

  private async writeTemplate() {
    if (!this.initialized) {
      throw new Error('NpmHelper is not initialized');
    }

    if (
      this.packageType === PackageType.Module &&
      !this.pkgxOptions.disableCjsOutput
    ) {
      await this.writeModuleCjsTemplate();
    }

    await writeFile(
      `./${this.pkgxOptions.outputDirName}/package.json`,
      JSON.stringify(this.template, null, 2),
    );
  }

  async generatePackageFiles() {
    await this.init();

    await this.fixRepository()
      .fixDependencies()
      .fixScripts()
      .fixCli()
      .fixName()
      .fixCommonAttributes()
      .writeTemplate();
  }
}

import { writeFile } from 'node:fs/promises';

import { PkgJson } from '../interfaces/pkg-json.interface.js';
import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getPkgJson } from './get-pkg-json.util.js';
import { isPathAvailable } from './is-path-available.util.js';

const ESM_TEMPLATE: PkgJson = {
  name: 'REPLACE_WITH_PACKAGE_NAME',
  version: 'REPLACE_WITH_PACKAGE_VERSION',
  description: 'REPLACE_WITH_PACKAGE_DESCRIPTION',
  type: 'module',
  main: './cjs/index.js',
  exports: {
    types: './index.d.ts',
    require: './cjs/index.js',
    import: './esm/index.js',
  },
  types: './index.d.ts',
  homepage: 'REPLACE_WITH_PACKAGE_HOMEPAGE',
  repository: {
    type: 'REPLACE_WITH_PACKAGE_REPOSITORY_TYPE',
    url: 'REPLACE_WITH_PACKAGE_REPOSITORY_URL',
  },
  author: 'REPLACE_WITH_PACKAGE_AUTHOR',
  license: 'REPLACE_WITH_PACKAGE_LICENSE',
  dependencies: {},
  peerDependencies: {},
};

const CJS_TEMPLATE: PkgJson = {
  name: 'REPLACE_WITH_PACKAGE_NAME',
  type: 'commonjs',
};

function fixDependencies(
  pkgxOptions: Required<PkgxOptions>,
  originDependencies: Record<string, string>,
) {
  const targetDependencies: Record<string, string> = {};

  Object.keys(originDependencies).map((key) => {
    if (pkgxOptions.excludeFromExternal.includes(key)) {
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

async function createEsmPackageJsonFile(
  pkgJson: PkgJson,
  pkgxOptions: Required<PkgxOptions>,
) {
  const templatePkgJson = ESM_TEMPLATE;

  if (
    !pkgJson.repository ||
    !pkgJson.repository.type ||
    !pkgJson.repository.url
  ) {
    templatePkgJson.repository = undefined;
  }

  templatePkgJson.dependencies = fixDependencies(
    pkgxOptions,
    pkgJson.dependencies || {},
  );
  templatePkgJson.peerDependencies = fixDependencies(
    pkgxOptions,
    pkgJson.peerDependencies || {},
  );

  templatePkgJson.scripts = {
    ...templatePkgJson.scripts,
    ...(pkgxOptions.addStartScript
      ? {
          start: 'node esm/index.js',
        }
      : {}),
    ...pkgxOptions.customScripts,
  };

  if (Object.keys(templatePkgJson.scripts).length < 1) {
    templatePkgJson.scripts = undefined;
  }

  if (pkgxOptions.cliInputFileName) {
    templatePkgJson.bin = {
      [pkgJson.name.includes('@') ? pkgJson.name.split('/')[1] : pkgJson.name]:
        './bin/index.js',
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

  await writeFile(`./${pkgxOptions.outputDirName}/package.json`, str);
}

async function createCjsPackageJsonFile(
  pkgJson: PkgJson,
  pkgxOptions: Required<PkgxOptions>,
) {
  const templatePkgJson = CJS_TEMPLATE;

  let str = JSON.stringify(templatePkgJson, null, 2);

  str = str.replace('REPLACE_WITH_PACKAGE_NAME', pkgJson.name);

  if (await isPathAvailable(`./${pkgxOptions.outputDirName}/cjs`)) {
    await writeFile(`./${pkgxOptions.outputDirName}/cjs/package.json`, str);
  }
}

export async function createPackageJsonFile(
  pkgxOptions: Required<PkgxOptions>,
) {
  const pkgJson = await getPkgJson();

  await Promise.all([
    createEsmPackageJsonFile(pkgJson, pkgxOptions),
    createCjsPackageJsonFile(pkgJson, pkgxOptions),
  ]);
}

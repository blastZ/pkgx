import { PkgJson } from '@libs/pkgx-common';

export const ESM_TEMPLATE: PkgJson = {
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

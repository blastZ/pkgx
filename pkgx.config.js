export default {
  cliInputFileName: 'cli.ts',
  cjsExcludeFromExternal: ['zx', 'globby', 'pretty-ms'],
  assets: ['README.md', 'libs/pkgx-plugin-docker/templates'],
  alias: {
    '@libs/pkgx-plugin-devkit': './dist/libs/pkgx-plugin-devkit/src',
  },
};

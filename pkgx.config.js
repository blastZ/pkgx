export default {
  cliInputFileName: 'cli.ts',
  cjsExcludeFromExternal: ['zx', 'globby', 'pretty-ms'],
  assets: ['README.md'],
  alias: {
    '@libs/pkgx-plugin-devkit': './dist/libs/pkgx-plugin-devkit/src',
  },
};

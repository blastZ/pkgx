#!/usr/bin/env node

import { $, cd } from 'zx';

async function buildPlugins(rollupPlugin, pkgxOptions) {
  await Promise.all(
    ['pkgx-plugin-docker', 'pkgx-plugin-web'].map((pluginName) => {
      return new rollupPlugin.BuildExecutor({
        ...pkgxOptions,
        inputDir: `libs/${pluginName}/src`,
        outputDirName: `output/libs/${pluginName}`,
        disableDtsOutput: true,
        disableCjsOutput: true,
      }).run();
    }),
  );
}

async function build() {
  await $`rm -rf ./dist`.quiet();

  await $`pnpm tsc && pnpm tsc-alias`.quiet();

  await $`rm -rf ./output`.quiet();

  const { getPkgxOptions } = await import('../dist/src/utils/index.js');
  const { rollupPlugin, npmPlugin } = await import('../dist/src/index.js');

  const pkgxOptions = await getPkgxOptions();

  await buildPlugins(rollupPlugin, pkgxOptions);

  const cliPkgxOptions = {
    ...pkgxOptions,
    cliInputFileName: 'cli.ts',
    cjsExcludeFromExternal: ['zx', 'globby', 'pretty-ms'],
    assets: [
      'README.md',
      'libs/pkgx-plugin-docker/templates',
      'libs/pkgx-plugin-nest/templates',
      'libs/*/pkgx.plugin.json',
    ],
    alias: {
      '@libs/pkgx-plugin-devkit': './dist/libs/pkgx-plugin-devkit/src',
    },
  };

  await new rollupPlugin.BuildExecutor(cliPkgxOptions).run();

  await $`mkdir -p ./output/templates`.quiet();
  await $`cp ./src/generators/ts/templates/* ./output/templates`.quiet();

  await new npmPlugin.PackageJsonFileGenerator(cliPkgxOptions).run();
  await new npmPlugin.CjsPackageJsonFileGenerator(cliPkgxOptions).run();

  cd('./output');

  await $`npm uninstall -g && npm install -g`.quiet();
}

await build();

#!/usr/bin/env node

import { $, cd } from 'zx';

async function buildPlugins(rollupPlugin) {
  await Promise.all(
    [
      'pkgx-plugin-docker',
      'pkgx-plugin-web',
      'pkgx-plugin-rollup',
      'pkgx-plugin-nest',
      'pkgx-plugin-npm',
    ].map((pluginName) => {
      return new rollupPlugin.BuildExecutor({
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

  const { rollupPlugin } = await import('../dist/src/index.js');

  await buildPlugins(rollupPlugin);

  await new rollupPlugin.BuildExecutor({
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
  }).run();

  await $`mkdir -p ./output/templates`.quiet();
  await $`cp ./src/generators/ts/templates/* ./output/templates`.quiet();

  cd('./output');

  await $`npm uninstall -g && npm install -g`.quiet();
}

await build();

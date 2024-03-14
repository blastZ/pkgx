#!/usr/bin/env node

import { $, cd } from 'zx';

async function buildPlugins() {
  const esbuildPlugin = await import(
    '../dist/libs/pkgx-plugin-esbuild/src/index.js'
  );

  await Promise.all(
    [
      'pkgx-plugin-docker',
      'pkgx-plugin-web',
      'pkgx-plugin-jest',
      'pkgx-plugin-nest',
      'pkgx-plugin-npm',
      'pkgx-plugin-node',
      'pkgx-plugin-rollup',
    ].map((pluginName) => {
      return new esbuildPlugin.BuildExecutor({
        inputDir: `libs/${pluginName}/src`,
        outputDirName: `output/libs/${pluginName}`,
        disableDtsOutput: true,
        disableCjsOutput: true,
      }).run();
    }),
  );
}

async function buildCore() {
  const rollupPlugin = await import(
    '../dist/libs/pkgx-plugin-rollup/src/index.js'
  );

  await new rollupPlugin.BuildExecutor({
    cliInputFileName: 'cli.ts',
    // cjsExcludeFromExternal: ['zx', 'globby', 'pretty-ms'],
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
}

async function build() {
  await $`rm -rf ./dist`.quiet();

  await $`pnpm tsc && pnpm tsc-alias`.quiet();

  await $`rm -rf ./output`.quiet();

  await buildPlugins();

  await buildCore();

  await $`mkdir -p ./output/templates`.quiet();
  await $`cp ./src/generators/ts/templates/* ./output/templates`.quiet();

  cd('./output');

  await $`npm uninstall -g && npm install -g`.quiet();
}

await build();

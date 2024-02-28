#!/usr/bin/env node

import { $, cd } from 'zx';

async function build() {
  await $`rm -rf ./dist`.quiet();

  await $`pnpm tsc && pnpm tsc-alias`.quiet();

  const { getPkgxOptions } = await import('../dist/src/utils/index.js');
  const { rollupPlugin, NpmGenerator } = await import('../dist/src/index.js');

  await $`rm -rf ./output`.quiet();

  const pkgxOptions = await getPkgxOptions();

  const executor = new rollupPlugin.BuildExecutor(pkgxOptions);

  await executor.run();

  await $`rm -rf ./output/esm/.dts`.quiet();

  await $`mkdir -p ./output/templates`.quiet();
  await $`cp ./src/generators/docker/templates/* ./output/templates`.quiet();
  await $`cp ./src/generators/ts/templates/* ./output/templates`.quiet();

  const npmGenerator = new NpmGenerator(pkgxOptions);

  await npmGenerator.generatePackageJsonFile();
  await npmGenerator.generateCjsPackageJsonFile();

  cd('./output');

  await $`npm uninstall -g && npm install -g`.quiet();
}

await build();

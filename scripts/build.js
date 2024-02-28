#!/usr/bin/env node

import { $, cd } from 'zx';

async function build() {
  await $`rm -rf ./dist`.quiet();

  await $`pnpm tsc && pnpm tsc-alias`.quiet();

  const { getPkgxOptions } = await import('../dist/src/utils/index.js');
  const { rollupPlugin, npmPlugin } = await import('../dist/src/index.js');

  await $`rm -rf ./output`.quiet();

  const pkgxOptions = await getPkgxOptions();

  await new rollupPlugin.BuildExecutor(pkgxOptions).run();

  await $`rm -rf ./output/esm/.dts`.quiet();

  await $`mkdir -p ./output/templates`.quiet();
  await $`cp ./src/generators/docker/templates/* ./output/templates`.quiet();
  await $`cp ./src/generators/ts/templates/* ./output/templates`.quiet();

  await new npmPlugin.PackageJsonFileGenerator(pkgxOptions).run();
  await new npmPlugin.CjsPackageJsonFileGenerator(pkgxOptions).run();

  cd('./output');

  await $`npm uninstall -g && npm install -g`.quiet();
}

await build();

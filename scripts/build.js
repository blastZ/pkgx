#!/usr/bin/env node

import { $, cd } from 'zx';

async function build() {
  await $`rm -rf ./dist`.quiet();

  await $`tsc`;

  const { getPkgxOptions, addCjsPackageJsonFile, addPackageJsonFile } =
    await import('../dist/src/utils/index.js');
  const { RollupExecutor } = await import(
    '../dist/src/executors/rollup/index.js'
  );

  await $`rm -rf ./output`.quiet();

  const pkgxOptions = {
    ...(await getPkgxOptions()),
    cliInputFileName: 'cli.ts',
  };

  const executor = new RollupExecutor();

  await executor.build(pkgxOptions);

  await $`rm -rf ./output/esm/.dts`.quiet();

  await $`mkdir -p ./output/templates`.quiet();
  await $`cp ./src/generators/docker/templates/* ./output/templates`.quiet();
  await $`cp ./src/generators/ts/templates/* ./output/templates`.quiet();

  await $`cp README.md ./output`.quiet();

  await addPackageJsonFile(pkgxOptions);
  await addCjsPackageJsonFile(pkgxOptions);

  cd('./output');

  await $`npm uninstall -g && npm install -g`.quiet();
}

await build();

import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { $ } from 'zx';

import { PkgxContext } from '@libs/pkgx-plugin-devkit';

export class TestExecutor {
  constructor(private context: PkgxContext) {}

  async run() {
    const require = createRequire(import.meta.url);

    const jestPath = require.resolve('jest');

    const jestBinPath = resolve(jestPath, '../../bin/jest.js');

    const args = [
      '--experimental-vm-modules',
      jestBinPath,
      ...this.context.cmdArguments,
    ];

    await $`node ${args}`.nothrow();
  }
}

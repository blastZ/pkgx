import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ReplaceModuleSuffixExecutor } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('@pkgx/node:replace-module-suffix', () => {
  it('should work', async () => {
    const path = resolve(__dirname, './projects');

    await new ReplaceModuleSuffixExecutor({
      cmdArguments: [path, '', '.js'],
      cmdOptions: {
        indexDirs: ['core'],
      },
    }).run();

    const aLines = (await readFile(resolve(path, './core/a.ts')))
      .toString()
      .split('\n');

    expect(aLines[0].endsWith(`b.js';`)).toBe(true);

    const coreIndexLines = (await readFile(resolve(path, './core/index.ts')))
      .toString()
      .split('\n');

    expect(coreIndexLines[0].endsWith(`a.js';`)).toBe(true);

    const indexLines = (await readFile(resolve(path, './index.ts')))
      .toString()
      .split('\n');

    expect(indexLines[0].endsWith(`core/index.js';`)).toBe(true);

    await new ReplaceModuleSuffixExecutor({
      cmdArguments: [path, '.js', ''],
      cmdOptions: {
        indexDirs: ['core'],
      },
    }).run();

    const aLines2 = (await readFile(resolve(path, './core/a.ts')))
      .toString()
      .split('\n');

    expect(aLines2[0].endsWith(`b';`)).toBe(true);

    const coreIndexLines2 = (await readFile(resolve(path, './core/index.ts')))
      .toString()
      .split('\n');

    expect(coreIndexLines2[0].endsWith(`a';`)).toBe(true);

    const indexLines2 = (await readFile(resolve(path, './index.ts')))
      .toString()
      .split('\n');

    expect(indexLines2[0].endsWith(`core';`)).toBe(true);
  });
});

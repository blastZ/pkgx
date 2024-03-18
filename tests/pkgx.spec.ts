import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { $, fs } from 'zx';

describe('pkgx', () => {
  // beforeAll(async () => {
  //   await $`./scripts/build.js`;
  // }, 30000);

  it('should build package', async () => {
    const dir = 'tests/projects/node-package';

    await $`pkgx build ${dir}`;

    const { maskStr, currentYear } = await import(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      './projects/node-package/output'
    );

    expect(maskStr('123456', 1, 4)).toBe('1****6');
    expect(currentYear()).toBe(new Date().getFullYear().toString());

    expect(
      (
        await fs.readFile(resolve(dir, './output/src/assets/temp.txt'))
      ).toString(),
    ).toEqual('temp');
    expect(
      (
        await fs.readFile(resolve(dir, './output/src/assets/views/home.ejs'))
      ).toString(),
    ).toEqual('<p>home</p>');

    const pkgJson = JSON.parse(
      (await fs.readFile(resolve(dir, './output/package.json'))).toString(),
    );

    expect(pkgJson.name).toEqual('node-package');
    expect(pkgJson.type).toEqual('module');
    expect(pkgJson.main).toEqual('./cjs/index.js');
    expect(pkgJson.exports).toEqual({
      types: './index.d.ts',
      require: './cjs/index.js',
      import: './esm/index.js',
    });
    expect(pkgJson.types).toEqual('./index.d.ts');
    expect(pkgJson.dependencies).toEqual({
      dayjs: '^1.11.10',
    });
    expect(pkgJson.version).toEqual('1.5.2');

    const cjsPkgJson = JSON.parse(
      (await fs.readFile(resolve(dir, './output/cjs/package.json'))).toString(),
    );

    expect(cjsPkgJson.name).toEqual('node-package');
    expect(cjsPkgJson.type).toEqual('commonjs');
  }, 5000);

  it('should build app', async () => {
    const dir = 'tests/projects/node-app';

    await $`pkgx build-app ${dir}`;

    const pkgJson = JSON.parse(
      (await fs.readFile(resolve(dir, './output/package.json'))).toString(),
    );

    expect(pkgJson.name).toEqual('node-app');
    expect(pkgJson.type).toEqual('module');
    expect(pkgJson.main).toEqual('./esm/index.js');
    expect(pkgJson.types).toEqual('./index.d.ts');
    expect(pkgJson.dependencies).toEqual({
      chalk: '^5.3.0',
      express: '^4.18.2',
    });
    expect(pkgJson.devDependencies).toBeUndefined();
    expect(pkgJson.version).toEqual('1.3.1');
    expect(pkgJson.scripts).toEqual({
      start: 'node esm/index.js',
      test: 'echo test',
    });

    const { app } = await import(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      './projects/node-app/output'
    );

    expect(app.listen).toBeDefined();
  }, 5000);

  it('should build cjs app', async () => {
    const dir = 'tests/projects/node-cjs-app';

    await $`pkgx build-app ${dir}`;

    const pkgJson = JSON.parse(
      (await fs.readFile(resolve(dir, './output/package.json'))).toString(),
    );

    expect(pkgJson.name).toEqual('node-cjs-app');
    expect(pkgJson.type).toBeUndefined();
    expect(pkgJson.main).toEqual('./cjs/index.js');
    expect(pkgJson.types).toEqual('./index.d.ts');
    expect(pkgJson.dependencies).toEqual({
      fastify: '^4.26.2',
    });
    expect(pkgJson.version).toEqual('2.2.2');
    expect(pkgJson.scripts).toEqual({
      start: 'node cjs/index.js',
    });
    expect(await fs.exists(resolve(dir, './output/cjs/package.json'))).toEqual(
      false,
    );

    const require = createRequire(import.meta.url);
    const {
      app,
    } = require(// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    './projects/node-cjs-app/output');

    expect(app.listen).toBeDefined();
  }, 5000);

  it('should work with config generator', async () => {
    const dir = 'tests/projects/temp-1';

    await $`mkdir -p ${dir}`.quiet();

    await $`pkgx g config ${dir}`.quiet();

    const t = await fs.exists(resolve(dir, 'pkgx.config.js'));

    expect(t).toBe(true);

    await $`rm -rf ${dir}`.quiet();
  });
});

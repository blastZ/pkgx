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

    const cjsPkgJson = JSON.parse(
      (await fs.readFile(resolve(dir, './output/cjs/package.json'))).toString(),
    );

    expect(cjsPkgJson.type).toEqual('commonjs');
  }, 5000);

  it('should build app', async () => {
    const dir = 'tests/projects/node-app';

    await $`pkgx build app ${dir}`;

    const { app } = await import(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      './projects/node-app/output/esm/index.js'
    );

    const pkgJson = JSON.parse(
      (await fs.readFile(resolve(dir, './output/package.json'))).toString(),
    );

    expect(app.listen).toBeDefined();
    expect(pkgJson.scripts.start).toBe('node esm/index.js');
    expect(pkgJson.scripts.test).toBe('echo test');
  }, 5000);

  it('should work with config generator', async () => {
    const dir = 'tests/projects/temp-1';

    await $`mkdir -p ${dir}`.quiet();

    await $`pkgx g config ${dir}`.quiet();

    const t = await fs.exists(resolve(dir, 'pkgx.config.js'));

    expect(t).toBe(true);

    await $`rm -rf ${dir}`.quiet();
  });

  it('should work with docker plugin', async () => {
    const dir = 'tests/projects/temp-2';

    await $`mkdir -p ${dir}`.quiet();

    await $`pkgx g dockerfile ${dir}`.quiet();
    await $`pkgx g dockerignore ${dir}`.quiet();

    const t1 = await fs.exists(resolve(dir, 'Dockerfile'));
    const t2 = await fs.exists(resolve(dir, '.dockerignore'));

    expect(t1).toBe(true);
    expect(t2).toBe(true);

    await $`rm -rf ${dir}`.quiet();
    await $`mkdir -p ${dir}`.quiet();

    await $`pkgx g @pkgx/docker:dockerfile ${dir}`.quiet();
    await $`pkgx g @pkgx/docker:dockerignore ${dir}`.quiet();

    const t3 = await fs.exists(resolve(dir, 'Dockerfile'));
    const t4 = await fs.exists(resolve(dir, '.dockerignore'));

    expect(t3).toBe(true);
    expect(t4).toBe(true);

    await $`rm -rf ${dir}`.quiet();
  });
});

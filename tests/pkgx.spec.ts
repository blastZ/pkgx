import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import request from 'supertest';
import { $, fs } from 'zx';

async function readFileToString(projectDir: string, filePath: string) {
  const str = (await fs.readFile(resolve(projectDir, filePath))).toString();

  return str;
}

async function readFileToJson(projectDir: string, filePath: string) {
  return JSON.parse(await readFileToString(projectDir, filePath));
}

async function importPackage(outputDir: string) {
  return import(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    outputDir
  );
}

function requirePackage(outputDir: string) {
  const require = createRequire(import.meta.url);

  return require(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    outputDir,
  );
}

describe('pkgx', () => {
  // beforeAll(async () => {
  //   await $`./scripts/build.js`;
  // }, 10000);

  it('should build package for cjs and esm', async () => {
    const dir = 'tests/projects/node-package';

    await $`pkgx build ${dir}`;

    const { maskStr, currentYear } = await importPackage(
      './projects/node-package/output',
    );

    expect(maskStr('123456', 1, 4)).toBe('1****6');
    expect(currentYear()).toBe(new Date().getFullYear().toString());

    expect(
      (await readFileToString(dir, './output/index.d.ts')).split('\n'),
    ).toEqual([
      'declare function maskStr(str: string, start: number, count: number): string;',
      'declare function currentYear(): string;',
      '',
      'export { currentYear, maskStr };',
      '',
    ]);

    expect(await readFileToString(dir, './output/src/assets/temp.txt')).toEqual(
      'temp',
    );
    expect(
      await readFileToString(dir, './output/src/assets/views/home.ejs'),
    ).toEqual('<p>home</p>');

    expect(await readFileToJson(dir, './output/package.json')).toEqual({
      name: 'node-package',
      type: 'module',
      main: './cjs/index.js',
      exports: {
        types: './index.d.ts',
        require: './cjs/index.js',
        import: './esm/index.js',
      },
      types: './index.d.ts',
      dependencies: {
        dayjs: '^1.11.10',
      },
      version: '1.5.2',
      description: '',
      homepage: '',
      author: '',
      license: 'ISC',
    });

    expect(await readFileToJson(dir, './output/cjs/package.json')).toEqual({
      name: 'node-package',
      type: 'commonjs',
    });
  }, 5000);

  it('should build esm app', async () => {
    const dir = 'tests/projects/node-app';

    const checkBuildResult = async () => {
      expect(await readFileToJson(dir, './output/package.json')).toEqual({
        name: 'node-app',
        type: 'module',
        main: './esm/index.js',
        types: './index.d.ts',
        dependencies: {
          chalk: '^5.3.0',
          express: '^4.18.2',
        },
        scripts: {
          start: 'node esm/index.js',
          test: 'echo test',
        },
        version: '1.3.1',
        description: '',
        homepage: '',
        author: '',
        license: 'ISC',
      });

      const { app } = await importPackage('./projects/node-app/output');

      expect(app.listen).toBeDefined();
    };

    await $`pkgx build-app ${dir}`;
    await checkBuildResult();

    await $`pkgx esbuild:build-app ${dir}`;
    await checkBuildResult();
  }, 5000);

  it('should build cjs app', async () => {
    const dir = 'tests/projects/node-cjs-app';

    const checkBuildResult = async () => {
      expect(await readFileToJson(dir, './output/package.json')).toEqual({
        name: 'node-cjs-app',
        main: './cjs/index.js',
        types: './index.d.ts',
        dependencies: {
          fastify: '^4.26.2',
        },
        scripts: {
          start: 'node cjs/index.js',
        },
        version: '2.2.2',
        description: '',
        homepage: '',
        author: '',
        license: 'ISC',
      });

      expect(
        await fs.exists(resolve(dir, './output/cjs/package.json')),
      ).toEqual(false);

      const { app } = requirePackage('./projects/node-cjs-app/output');

      expect(app.listen).toBeDefined();
    };

    await $`pkgx build-app ${dir}`;
    await checkBuildResult();

    await $`pkgx esbuild:build-app ${dir}`;
    await checkBuildResult();
  }, 5000);

  it('should build nest cjs app', async () => {
    const dir = 'tests/projects/nest-cjs-app';

    const checkBuildResult = async () => {
      const { getServer } = requirePackage('./projects/nest-cjs-app/output');

      const server = await getServer();

      const res = await request(server).get('/configs');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ name: 'nest-cjs-app' });
    };

    await $`pkgx build-app ${dir}`;
    await checkBuildResult();

    await $`pkgx esbuild:build-app ${dir}`;
    await checkBuildResult();
  });

  it('should build nest esm app', async () => {
    const dir = 'tests/projects/nest-esm-app';

    const checkBuildResult = async () => {
      const { getServer } = await importPackage(
        './projects/nest-esm-app/output',
      );

      const server = await getServer();

      const res = await request(server).get('/configs');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ name: 'nest-esm-app' });
    };

    await $`pkgx build-app ${dir}`;
    await checkBuildResult();

    await $`pkgx esbuild:build-app ${dir}`;
    await checkBuildResult();
  });

  it('should build simplest', async () => {
    const dir = 'tests/projects/simplest';

    await $`pkgx build ${dir}`;

    const { echo } = await importPackage('./projects/simplest/output');

    expect(echo('123')).toBe('123');

    expect(await readFileToJson(dir, './output/package.json')).toEqual({
      name: 'simplest',
      main: './cjs/index.js',
      types: './index.d.ts',
      version: '1.0.0',
      description: '',
      homepage: '',
      author: '',
      license: 'ISC',
    });
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

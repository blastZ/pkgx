import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { $, fs } from 'zx';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('@pkgx/docker generators', () => {
  it('should generate dockerfile', async () => {
    await $`pkgx g dockerfile ${__dirname}`.quiet();

    const t = await fs.exists(resolve(__dirname, 'Dockerfile'));

    expect(t).toBe(true);

    await $`rm -rf ${__dirname}/Dockerfile`.quiet();

    await $`pkgx g @pkgx/docker:dockerfile ${__dirname}`.quiet();

    const t2 = await fs.exists(resolve(__dirname, 'Dockerfile'));

    expect(t2).toBe(true);

    await $`rm -rf ${__dirname}/Dockerfile`.quiet();
  });

  it('should generate dockerignore', async () => {
    await $`pkgx g dockerignore ${__dirname}`.quiet();

    const t = await fs.exists(resolve(__dirname, '.dockerignore'));

    expect(t).toBe(true);

    await $`rm -rf ${__dirname}/.dockerignore`.quiet();

    await $`pkgx g @pkgx/docker:dockerignore ${__dirname}`.quiet();

    const t2 = await fs.exists(resolve(__dirname, '.dockerignore'));

    expect(t2).toBe(true);

    await $`rm -rf ${__dirname}/.dockerignore`.quiet();
  });
});

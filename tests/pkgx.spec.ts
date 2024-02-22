import { $, cd, fs } from 'zx';

describe('pkgx', () => {
  // beforeAll(async () => {
  //   await $`./scripts/build.js`;
  // }, 30000);

  it('should build package', async () => {
    cd('tests/projects/node-package');

    await $`pkgx build .`;

    // @ts-ignore
    const { maskStr, currentYear } = await import(
      './projects/node-package/output'
    );

    expect(maskStr('123456', 1, 4)).toBe('1****6');
    expect(currentYear()).toBe(new Date().getFullYear().toString());

    expect(
      (await fs.readFile('./output/src/assets/temp.txt')).toString(),
    ).toEqual('temp');
    expect(
      (await fs.readFile('./output/src/assets/views/home.ejs')).toString(),
    ).toEqual('<p>home</p>');
  });
});

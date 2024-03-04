import { resolve } from 'node:path';

import { globby } from 'globby';

import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

export const DEFAULT_CONFIG_BASE = 'pkgx.config';

export async function getPkgxConfigFileOptions(): Promise<PkgxOptions> {
  const paths = await globby(`${DEFAULT_CONFIG_BASE}.{js,mjs,cjs}`);

  if (paths.length < 1) {
    return {};
  }

  const config = (await import(resolve('.', paths[0]))).default;

  return config;
}

import { resolve } from 'node:path';

import { globby } from 'globby';

import type { PkgxOptions } from './interfaces/pkgx-options.interface.js';

export const DEFAULT_CONFIG_BASE = 'pkgx.config';

export async function readPkgxConfigFile(): Promise<PkgxOptions> {
  const paths = await globby(`${DEFAULT_CONFIG_BASE}.{js,mjs,cjs}`);

  if (paths.length < 1) {
    return {};
  }

  const config = (await import(resolve('.', paths[0]))).default;

  return config;
}

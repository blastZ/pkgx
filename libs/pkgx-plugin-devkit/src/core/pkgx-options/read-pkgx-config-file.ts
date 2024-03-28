import { resolve } from 'node:path';

import { globby } from 'globby';

import { printDiagnostics } from '../../utils/print-diagnostics.util.js';

import type { PkgxOptions } from './interfaces/pkgx-options.interface.js';

export const DEFAULT_CONFIG_BASE = 'pkgx.config';

export async function readPkgxConfigFile(): Promise<PkgxOptions> {
  const diagnostics = ['@pkgx/devkit::readPkgxConfigFile'];

  const paths = await globby(`${DEFAULT_CONFIG_BASE}.{js,mjs,cjs}`);

  if (paths.length < 1) {
    printDiagnostics(...diagnostics, `no pkgx config file found`);

    return {};
  }

  const config = (await import(resolve('.', paths[0]))).default;

  printDiagnostics(...diagnostics, paths[0], config);

  return config;
}

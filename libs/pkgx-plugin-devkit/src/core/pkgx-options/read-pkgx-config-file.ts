import { resolve } from 'node:path';

import { globby } from 'globby';

import { printDiagnostics } from '../../utils/print-diagnostics.util.js';

import type { PkgxOptions } from './interfaces/pkgx-options.interface.js';

export const DEFAULT_CONFIG_BASE = 'pkgx.config';

export async function readPkgxConfigFile(): Promise<PkgxOptions> {
  const scope = '@pkgx/devkit';
  const namespace = ['core', 'pkgx-options', 'read-pkgx-config-file.ts'];

  const paths = await globby(`${DEFAULT_CONFIG_BASE}.{js,mjs,cjs}`);

  if (paths.length < 1) {
    printDiagnostics(scope, namespace, { msg: `no pkgx config file found` });

    return {};
  }

  const config = (await import(resolve('.', paths[0]))).default;

  printDiagnostics(scope, namespace, { file: paths[0], config });

  return config;
}

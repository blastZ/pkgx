import { extname, resolve } from 'node:path';

import { globby } from 'globby';

import { printDiagnostics } from '../../utils/print-diagnostics.util.js';

import type { PkgxOptions } from './interfaces/pkgx-options.interface.js';

const scope = '@pkgx/devkit';
const namespace = ['core', 'pkgx-options', 'read-pkgx-config-file.ts'];

export const DEFAULT_CONFIG_BASE = 'pkgx.config';

export async function readPkgxConfigFile(): Promise<PkgxOptions> {
  let pattern = `${DEFAULT_CONFIG_BASE}.{js,mjs,cjs}`;

  if (process.env.PKGX_CONFIG_FILE) {
    const configFile = process.env.PKGX_CONFIG_FILE;

    const extension = extname(configFile);

    if (extension) {
      if (!['.js', '.mjs', '.cjs'].includes(extension)) {
        throw new Error('invalid config file extension');
      }

      pattern = configFile;
    } else {
      pattern = `${configFile}.{js,mjs,cjs}`;
    }
  }

  const paths = await globby(pattern);

  if (paths.length < 1) {
    printDiagnostics(scope, namespace, {
      pattern,
      msg: `no pkgx config file found`,
    });

    return {};
  }

  const config = (await import(resolve('.', paths[0]))).default;

  printDiagnostics(scope, namespace, { pattern, file: paths[0], config });

  return config;
}

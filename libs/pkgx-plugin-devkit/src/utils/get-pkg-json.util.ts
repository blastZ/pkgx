import { resolve } from 'node:path';

import { PkgJson } from '../interfaces/pkg-json.interface.js';

import { isPathAvailable } from './is-path-available.util.js';
import { readJsonFile } from './read-json-file.util.js';

export async function getPkgJson(cwd: string = process.cwd(), silent = false) {
  const pkgJsonPath = resolve(cwd, './package.json');

  if (silent) {
    const canIRead = await isPathAvailable(pkgJsonPath);

    if (!canIRead) {
      return {
        name: 'anonymous',
      };
    }
  }

  const pkgJson = await readJsonFile<PkgJson>(pkgJsonPath);

  if (typeof pkgJson.name !== 'string') {
    pkgJson.name = 'anonymous';
  }

  return pkgJson;
}

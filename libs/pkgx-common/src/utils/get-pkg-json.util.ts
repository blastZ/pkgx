import { resolve } from 'node:path';

import { PkgJson } from '../interfaces/pkg-json.interface.js';

import { readJsonFile } from './read-json-file.util.js';

export function getPkgJson(dir?: string) {
  const pkgJsonPath = dir ? resolve(dir, './package.json') : './package.json';

  const pkgJson = readJsonFile<PkgJson>(pkgJsonPath);

  if (typeof pkgJson.name !== 'string') {
    pkgJson.name = 'anonymous';
  }

  return pkgJson;
}

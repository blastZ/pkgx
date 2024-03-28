import type { PkgJson } from '../interfaces/pkg-json.interface.js';

import { isPathAvailable } from './is-path-available.util.js';
import { printDiagnostics } from './print-diagnostics.util.js';
import { readJsonFile } from './read-json-file.util.js';

export const BASE_NAME = 'package.json';

const map = new Map<string, PkgJson | undefined>();

export async function readPackageJsonFile(filePath: string) {
  const diagnostics = ['@pkgx/devkit::readPackageJsonFile', filePath];

  if (map.has(filePath)) {
    return map.get(filePath);
  }

  const canIRead = await isPathAvailable(filePath);

  if (!canIRead) {
    printDiagnostics(...diagnostics, 'file not available');

    map.set(filePath, undefined);

    return undefined;
  }

  const pkgJson = await readJsonFile<PkgJson>(filePath);

  map.set(filePath, pkgJson);

  printDiagnostics(...diagnostics, pkgJson);

  return pkgJson;
}

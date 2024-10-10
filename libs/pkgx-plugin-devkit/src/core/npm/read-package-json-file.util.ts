import { isPathAvailable } from '../../utils/is-path-available.util.js';
import { printDiagnostics } from '../../utils/print-diagnostics.util.js';
import { readJsonFile } from '../../utils/read-json-file.util.js';

import type { PkgJson } from './interfaces/pkg-json.interface.js';

export const BASE_NAME = 'package.json';

const map = new Map<string, PkgJson | undefined>();

export async function readPackageJsonFile(filePath: string) {
  const scope = '@pkgx/devkit';
  const namespace = ['core', 'npm', 'read-package-json-file.util.ts'];

  if (map.has(filePath)) {
    return map.get(filePath);
  }

  const canIRead = await isPathAvailable(filePath);

  if (!canIRead) {
    printDiagnostics(scope, namespace, {
      filePath,
      msg: 'file not available',
    });

    map.set(filePath, undefined);

    return undefined;
  }

  const pkgJson = await readJsonFile<PkgJson>(filePath);

  map.set(filePath, pkgJson);

  printDiagnostics(scope, namespace, { filePath, pkgJson });

  return pkgJson;
}

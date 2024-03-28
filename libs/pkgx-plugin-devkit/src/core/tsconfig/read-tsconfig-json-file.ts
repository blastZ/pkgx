import { isPathAvailable } from '../../utils/is-path-available.util.js';
import { printDiagnostics } from '../../utils/print-diagnostics.util.js';
import { readJsonFile } from '../../utils/read-json-file.util.js';

import type { TsconfigJson } from './interfaces/tsconfig-json.interface.js';

const map = new Map<string, TsconfigJson | undefined>();

export async function readTsconfigJsonFile(filePath: string) {
  const diagnostics = ['@pkgx/devkit::readTsconfigJsonFile', filePath];

  if (map.has(filePath)) {
    return map.get(filePath);
  }

  const canIRead = await isPathAvailable(filePath);

  if (!canIRead) {
    printDiagnostics(...diagnostics, 'file not available');

    map.set(filePath, undefined);

    return undefined;
  }

  const tsconfigJson = await readJsonFile<TsconfigJson>(filePath);

  map.set(filePath, tsconfigJson);

  printDiagnostics(...diagnostics, tsconfigJson);

  return tsconfigJson;
}

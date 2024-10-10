import { isPathAvailable } from '../../utils/is-path-available.util.js';
import { printDiagnostics } from '../../utils/print-diagnostics.util.js';
import { readJsonFile } from '../../utils/read-json-file.util.js';

import type { TsconfigJson } from './interfaces/tsconfig-json.interface.js';

const map = new Map<string, TsconfigJson | undefined>();

export async function readTsconfigJsonFile(filePath: string) {
  const scope = '@pkgx/devkit';
  const namespace = ['core', 'tsconfig', 'read-tsconfig-json-file.ts'];

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

  const tsconfigJson = await readJsonFile<TsconfigJson>(filePath);

  map.set(filePath, tsconfigJson);

  printDiagnostics(scope, namespace, { filePath, tsconfigJson });

  return tsconfigJson;
}

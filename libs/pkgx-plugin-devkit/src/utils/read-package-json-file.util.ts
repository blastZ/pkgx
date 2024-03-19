import { PkgJson } from '../interfaces/pkg-json.interface.js';

import { isPathAvailable } from './is-path-available.util.js';
import { readJsonFile } from './read-json-file.util.js';

export const BASE_NAME = 'package.json';

const map = new Map<string, PkgJson | undefined>();

export async function readPackageJsonFile(filePath: string) {
  if (map.has(filePath)) {
    return map.get(filePath);
  }

  const canIRead = await isPathAvailable(filePath);

  if (!canIRead) {
    // logger.info(
    //   `${chalk.cyan(relative(process.cwd(), filePath))} is not available`,
    // );

    map.set(filePath, undefined);

    return undefined;
  }

  const pkgJson = await readJsonFile<PkgJson>(filePath);

  map.set(filePath, pkgJson);

  return pkgJson;
}

import { isPathAvailable } from '../../utils/is-path-available.util.js';
import { readJsonFile } from '../../utils/read-json-file.util.js';

import type { TsconfigJson } from './interfaces/tsconfig-json.interface.js';

const map = new Map<string, TsconfigJson | undefined>();

export async function readTsconfigJsonFile(filePath: string) {
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

  const tsconfigJson = await readJsonFile<TsconfigJson>(filePath);

  map.set(filePath, tsconfigJson);

  return tsconfigJson;
}

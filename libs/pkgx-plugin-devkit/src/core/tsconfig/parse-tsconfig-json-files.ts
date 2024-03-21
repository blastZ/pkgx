import { dirname, resolve } from 'node:path';

import { TSCONFIG_FILE_NAME } from './constants/tsconfig-file-name.constant.js';
import { readTsconfigJsonFile } from './read-tsconfig-json-file.js';

export async function parseTsconfigJsonFiles(cwd: string) {
  const tsconfigJsonPath = resolve(cwd, TSCONFIG_FILE_NAME);

  const tsconfigJson = await readTsconfigJsonFile(tsconfigJsonPath);

  let isWsp = false;
  let wspDir = cwd;
  let wspTsconfigJsonPath = tsconfigJsonPath;
  let wspTsconfigJson = undefined;

  if (tsconfigJson?.extends) {
    isWsp = true;

    wspTsconfigJsonPath = resolve(cwd, tsconfigJson.extends);
    wspDir = resolve(cwd, dirname(tsconfigJson.extends));
    wspTsconfigJson = await readTsconfigJsonFile(wspTsconfigJsonPath);
  }

  return {
    isWsp,
    wspDir,
    tsconfigJsonPath,
    wspTsconfigJsonPath,
    tsconfigJson,
    wspTsconfigJson,
  };
}

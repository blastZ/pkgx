import { dirname, resolve } from 'node:path';

import {
  TSCONFIG_FILE_NAME,
  readTsconfigJsonFile,
} from '../core/tsconfig/index.js';

export async function getRootDirFromTsconfig(cwd: string = process.cwd()) {
  const tsconfigJson = await readTsconfigJsonFile(
    resolve(cwd, TSCONFIG_FILE_NAME),
  );

  let rootDir = cwd;

  if (tsconfigJson?.extends) {
    rootDir = resolve(rootDir, dirname(tsconfigJson.extends));
  }

  return rootDir;
}

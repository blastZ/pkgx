import { dirname, resolve } from 'node:path';

import { readTsconfigJsonFile } from '../core/tsconfig/index.js';

export async function getRootDirFromTsconfig(cwd: string = process.cwd()) {
  const tsconfigJson = await readTsconfigJsonFile(cwd);

  let rootDir = cwd;

  if (tsconfigJson?.extends) {
    rootDir = resolve(rootDir, dirname(tsconfigJson.extends));
  }

  return rootDir;
}

import { dirname, resolve } from 'node:path';

import { getTsconfigJson } from './get-tsconfig-json.util.js';

export async function getRootDirFromTsconfig(cwd: string = process.cwd()) {
  const tsconfigJson = await getTsconfigJson(cwd);

  let rootDir = cwd;

  if (tsconfigJson.extends) {
    rootDir = resolve(rootDir, dirname(tsconfigJson.extends));
  }

  return rootDir;
}

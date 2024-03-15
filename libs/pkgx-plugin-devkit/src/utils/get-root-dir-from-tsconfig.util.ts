import { dirname, resolve } from 'node:path';

import { getTsconfigJson } from './get-tsconfig-json.util.js';

export async function getRootDirFromTsconfig(cwd: string = process.cwd()) {
  const tsconfigJson = await getTsconfigJson(cwd);

  let rootDir = '';

  if (tsconfigJson.extends) {
    rootDir = resolve('.', dirname(tsconfigJson.extends));
  }

  if (rootDir === '') {
    return process.cwd();
  }

  return rootDir;
}

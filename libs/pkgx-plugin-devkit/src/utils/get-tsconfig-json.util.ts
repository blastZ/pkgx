import { resolve } from 'node:path';

import { readJsonFile } from './read-json-file.util.js';

interface TsconfigJson {
  extends?: string;
}

export async function getTsconfigJson(dir?: string) {
  const tsconfigJsonPath = dir
    ? resolve(dir, './tsconfig.json')
    : './tsconfig.json';

  const tsconfigJson = await readJsonFile<TsconfigJson>(tsconfigJsonPath);

  return tsconfigJson;
}

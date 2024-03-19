import { resolve } from 'node:path';

import { getRootDirFromTsconfig } from './get-root-dir-from-tsconfig.util.js';
import { BASE_NAME } from './read-package-json-file.util.js';

export interface ParsePackageJsonPathsResult {
  isWsp: boolean;
  pkgJsonPath: string;
  wspPkgJsonPath: string;
}

export async function parsePackageJsonPaths(
  cwd: string,
): Promise<ParsePackageJsonPathsResult> {
  const pkgJsonPath = resolve(cwd, `./${BASE_NAME}`);

  let isWsp = false;

  const rootDir = await getRootDirFromTsconfig(cwd);

  if (rootDir !== cwd) {
    isWsp = true;
  }

  const wspPkgJsonPath = resolve(rootDir, `./${BASE_NAME}`);

  return {
    isWsp,
    pkgJsonPath,
    wspPkgJsonPath,
  };
}

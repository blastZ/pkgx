import { resolve } from 'node:path';

import { parseTsconfigJsonFiles } from '../core/tsconfig/index.js';

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

  const { isWsp, wspDir } = await parseTsconfigJsonFiles(cwd);

  const wspPkgJsonPath = resolve(wspDir, `./${BASE_NAME}`);

  return {
    isWsp,
    pkgJsonPath,
    wspPkgJsonPath,
  };
}

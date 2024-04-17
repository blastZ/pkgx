import { resolve } from 'node:path';

import { printDiagnostics } from '../../utils/print-diagnostics.util.js';
import { parseTsconfigJsonFiles } from '../tsconfig/index.js';

import { BASE_NAME } from './read-package-json-file.util.js';

export interface ParsePackageJsonPathsResult {
  isWsp: boolean;
  pkgJsonPath: string;
  wspPkgJsonPath: string;
}

const map = new Map<string, ParsePackageJsonPathsResult>();

export async function parsePackageJsonPaths(
  cwd: string,
): Promise<ParsePackageJsonPathsResult> {
  const diagnostics = ['@pkgx/devkit::parsePackageJsonPaths', cwd];

  const cached = map.get(cwd);

  if (cached) {
    return cached;
  }

  const pkgJsonPath = resolve(cwd, `./${BASE_NAME}`);

  const { isWsp, wspDir } = await parseTsconfigJsonFiles(cwd);

  const wspPkgJsonPath = resolve(wspDir, `./${BASE_NAME}`);

  const result = {
    isWsp,
    pkgJsonPath,
    wspPkgJsonPath,
  };

  map.set(cwd, result);

  printDiagnostics(...diagnostics, result);

  return result;
}

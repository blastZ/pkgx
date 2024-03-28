import { dirname, resolve } from 'node:path';

import { printDiagnostics } from '../../utils/print-diagnostics.util.js';

import { TSCONFIG_FILE_NAME } from './constants/tsconfig-file-name.constant.js';
import type { TsconfigJson } from './interfaces/tsconfig-json.interface.js';
import { readTsconfigJsonFile } from './read-tsconfig-json-file.js';

const map = new Map<string, ParseTsconfigJsonFilesResult>();

export interface ParseTsconfigJsonFilesResult {
  isWsp: boolean;
  wspDir: string;
  tsconfigJsonPath: string;
  wspTsconfigJsonPath: string;
  tsconfigJson: TsconfigJson | undefined;
  wspTsconfigJson: TsconfigJson | undefined;
}

export async function parseTsconfigJsonFiles(cwd: string) {
  const diagnostics = ['@pkgx/devkit::parseTsconfigJsonFiles', cwd];

  const cached = map.get(cwd);

  if (cached) {
    return cached;
  }

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

  const result = {
    isWsp,
    wspDir,
    tsconfigJsonPath,
    wspTsconfigJsonPath,
    tsconfigJson,
    wspTsconfigJson,
  };

  map.set(cwd, result);

  printDiagnostics(...diagnostics, result);

  return result;
}

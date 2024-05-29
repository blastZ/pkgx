import { basename, dirname, resolve } from 'node:path';

import { globby } from 'globby';

import { logger } from '../../utils/logger.util.js';
import { printDiagnostics } from '../../utils/print-diagnostics.util.js';

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

function getTsconfigJsonPath(cwd: string, paths: string[]) {
  const priorities = [
    'tsconfig.json',
    'tsconfig.build.json',
    'tsconfig.app.json',
  ];

  let index = priorities.length;
  let result: string | undefined;

  for (const path of paths) {
    const filename = basename(path);
    const newIndex = priorities.indexOf(filename);

    if (newIndex > -1 && newIndex < index) {
      result = path;
      index = newIndex;
    }
  }

  if (result) {
    return result;
  }

  return resolve(cwd, priorities[0]);
}

export async function parseTsconfigJsonFiles(cwd: string) {
  const scope = '@pkgx/devkit';
  const namespace = ['core', 'tsconfig', 'parse-tsconfig-json-files.ts'];

  const cached = map.get(cwd);

  if (cached) {
    return cached;
  }

  const tsconfigPaths = await globby(['tsconfig.json', 'tsconfig.*.json'], {
    cwd,
  });

  const tsconfigJsonPath = getTsconfigJsonPath(cwd, tsconfigPaths);

  if (tsconfigPaths.length > 1) {
    logger.warn(`multiple tsconfig files found, using "${tsconfigJsonPath}"`);
  }

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

  printDiagnostics(scope, namespace, { cwd, result });

  return result;
}

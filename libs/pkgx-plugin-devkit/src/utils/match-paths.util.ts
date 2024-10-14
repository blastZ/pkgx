import { posix, sep } from 'node:path';

import { globby, type Options } from 'globby';

import { printDiagnostics } from './print-diagnostics.util.js';

export function pathToGlobPattern(path: string, separator = sep) {
  const parts = path.split(separator);

  if (parts[0] === '') {
    return posix.join('/', ...parts);
  }

  return posix.join(...parts);
}

export async function matchPaths(
  patterns: string | readonly string[],
  options?: Options,
) {
  const patternsList = Array.isArray(patterns) ? patterns : [patterns];

  const fixedPatterns = patternsList.map((pattern) =>
    pathToGlobPattern(pattern),
  );

  printDiagnostics('@pkgx/devkit', ['utils', 'match-paths.util.ts'], {
    patterns,
    fixedPatterns,
  });

  const paths = await globby(fixedPatterns, options);

  return paths;
}

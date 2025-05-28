import { join, parse } from 'node:path';

import type { CopyFilePattern } from '../interfaces/copy-file-pattern.interface.js';

import { copyFile } from './copy-file.util.js';
import { isDir } from './is-dir.util.js';
import { matchPaths } from './match-paths.util.js';
import { printDiagnostics } from './print-diagnostics.util.js';

interface Options {
  destDir?: string;
}

async function filterRedundantPaths(paths: string[]): Promise<string[]> {
  if (paths.length === 0) {
    return paths;
  }

  const sortedPaths = paths.sort((a, b) => a.length - b.length);

  const filtered: string[] = [];

  for (const path of sortedPaths) {
    let isContainedByParent = false;

    for (const filteredPath of filtered) {
      if (await isDir(filteredPath)) {
        if (path.startsWith(filteredPath)) {
          isContainedByParent = true;

          break;
        }
      }
    }

    if (isContainedByParent) {
      continue;
    }

    filtered.push(path);
  }

  return filtered;
}

export async function copyFiles(
  patterns: (string | CopyFilePattern)[],
  options: Options = {},
) {
  await Promise.all(
    patterns.map(async (p) => {
      {
        const isSrc = typeof p === 'string';
        const src = isSrc ? p : p.src;
        const globOptions = isSrc ? undefined : p.globOptions;

        const matchedPaths = await matchPaths(src, {
          expandDirectories: false,
          onlyFiles: false,
          ...globOptions,
        });

        /**
         * copyFile 会递归复制整个文件夹，因此这里需要过滤掉子路径，避免重复复制操作
         */
        const filteredPaths = await filterRedundantPaths(matchedPaths);

        printDiagnostics('@pkgx/devkit', ['utils', 'copy-files.util.ts'], {
          matchedPaths,
          filteredPaths,
        });

        if (filteredPaths.length < 1) {
          return;
        }

        await Promise.all(
          filteredPaths.map(async (matchedPath) => {
            if (!isSrc) {
              return await copyFile(matchedPath, p.dest, p.options);
            }

            const { dir, base } = parse(matchedPath);

            return await copyFile(
              matchedPath,
              join(options.destDir || '', dir, base),
            );
          }),
        );
      }
    }),
  );
}

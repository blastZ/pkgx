import { join, parse } from 'node:path';

import { globby } from 'globby';

import type { CopyFilePattern } from '../interfaces/copy-file-pattern.interface.js';

import { copyFile } from './copy-file.util.js';

interface Options {
  destDir?: string;
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

        const matchedPaths = await globby(src, {
          expandDirectories: false,
          onlyFiles: false,
          ...globOptions,
        });

        if (matchedPaths.length < 1) {
          return;
        }

        await Promise.all(
          matchedPaths.map(async (matchedPath) => {
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

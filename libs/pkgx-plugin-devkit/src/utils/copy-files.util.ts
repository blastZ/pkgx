import { globby } from 'globby';

import { CopyFilePattern } from '../interfaces/copy-file-pattern.interface.js';

import { copyFile } from './copy-file.util.js';

export async function copyFiles(patterns: CopyFilePattern[]) {
  for (const pattern of patterns) {
    const { src, dest, options, globOptions } = pattern;

    const matchedPaths = await globby(src, {
      expandDirectories: false,
      onlyFiles: false,
      ...globOptions,
    });

    if (matchedPaths.length) {
      for (const matchedPath of matchedPaths) {
        await copyFile(matchedPath, dest, options);
      }
    }
  }
}

import { join, parse } from 'node:path';

import { chalk, fs } from 'zx';

import { isDir } from './is-dir.util.js';
import { logger } from './logger.util.js';
import { printDiagnostics } from './print-diagnostics.util.js';

export async function copyFile(
  src: string,
  dest: string,
  options?: fs.CopyOptions,
) {
  const isSrcDir = await isDir(src);
  const isDestDir = await isDir(dest);

  let destination = dest;

  if (!isSrcDir && isDestDir) {
    const { base } = parse(src);

    destination = join(dest, base);
  }

  try {
    await fs.copy(src, destination, options);
  } catch (err) {
    printDiagnostics('@pkgx/devkit', ['utils', 'copy-file.util.ts'], {
      copyError: err,
    });

    logger.error(`failed to copy ${src} → ${destination}`);
  }

  logger.info(
    `copied ${chalk.magentaBright(src)} → ${chalk.magentaBright(destination)}`,
  );
}

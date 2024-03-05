import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import { chalk } from 'zx';

import { PkgxContext, logger } from '@libs/pkgx-plugin-devkit';

import { ReplaceModuleSuffixOptions } from './replace-module-suffix-options.interface.js';

const REG_EXP = new RegExp(
  `(import\\s+.+from\\s+['"]|export\\s+.+from\\s+['"])` +
    `(\\.\\/|..\\/)` +
    `(.+)` +
    `(['"])`,
  'g',
);

export class ReplaceModuleSuffixExecutor {
  private oldSuffix: string;
  private newSuffix: string;

  constructor(private context: PkgxContext<ReplaceModuleSuffixOptions>) {
    this.oldSuffix = context.cmdArguments[1];
    this.newSuffix = context.cmdArguments[2];
  }

  private async replaceSuffixByFile(path: string) {
    if (this.newSuffix === this.oldSuffix) {
      return;
    }

    if (!['.ts', '.js', '.mjs', '.cjs'].includes(extname(path))) {
      return;
    }

    let content = await readFile(path, 'utf-8');

    content = content.replace(REG_EXP, (match, $1, $2, $3, $4) => {
      if (this.oldSuffix === '') {
        if ($3.slice(-this.newSuffix.length) === this.newSuffix) {
          return match;
        }

        const dirName = $3.split('/').at(-1);

        if (this.context.cmdOptions.indexDirs?.includes(dirName)) {
          return `${$1}${$2}${$3}/index${this.newSuffix}${$4}`;
        }

        return `${$1}${$2}${$3}${this.newSuffix}${$4}`;
      }

      if ($3.slice(-this.oldSuffix.length) === this.oldSuffix) {
        if ($3.endsWith(`/index${this.oldSuffix}`) && this.newSuffix === '') {
          return `${$1}${$2}${$3.slice(0, -(this.oldSuffix.length + 6))}${this.newSuffix}${$4}`;
        }

        return `${$1}${$2}${$3.slice(0, -this.oldSuffix.length)}${this.newSuffix}${$4}`;
      }

      return match;
    });

    await writeFile(path, content);
  }

  private async replaceSuffixByDir(path: string) {
    const exclude = [
      'dist',
      'output',
      'node_modules',
      '.next',
      '.git',
      '.vscode',
    ];

    const files = await readdir(path);

    for (const file of files) {
      const filePath = join(path, file);

      const stats = await stat(filePath);

      if (stats.isDirectory()) {
        if (exclude.includes(file)) {
          continue;
        }

        await this.replaceSuffixByDir(filePath);
      }

      if (stats.isFile()) {
        await this.replaceSuffixByFile(filePath);
      }
    }
  }

  private async replaceSuffix(path: string) {
    const stats = await stat(path);

    if (stats.isDirectory()) {
      await this.replaceSuffixByDir(path);
    }

    if (stats.isFile()) {
      await this.replaceSuffixByFile(path);
    }
  }

  async run() {
    const [startPath] = this.context.cmdArguments;

    logger.info(
      'Replace module suffix with regex: ' + chalk.cyan(REG_EXP.toString()),
    );

    await this.replaceSuffix(startPath);

    logger.info('Replacement completed.');
  }
}

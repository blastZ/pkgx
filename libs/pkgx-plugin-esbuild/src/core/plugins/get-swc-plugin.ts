import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inspect } from 'node:util';

import { transform } from '@swc/core';
import type { Plugin } from 'esbuild';

import type { PkgxOptions } from '@libs/pkgx-plugin-devkit';

const DEBUG = false;

const swcPlugin: (options: Required<PkgxOptions>) => Plugin = (options) => ({
  name: 'swc',
  setup(build) {
    const tsx = false;

    build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, async (args) => {
      const ts = await readFile(args.path, 'utf8').catch((err) => {
        printDiagnostics({ file: args.path, err });

        throw new Error(`failed to read file: ${args.path}`);
      });

      const result = await transform(ts, {
        filename: path.basename(args.path),
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
          target: 'esnext',
          loose: true,
        },
        sourceMaps: options.sourceMap ? 'inline' : false,
      }).catch((err) => {
        printDiagnostics({ file: args.path, err });

        throw new Error(`failed to transform file: ${args.path}`);
      });

      if (DEBUG) {
        printDiagnostics(result.code);
      }

      return { contents: result.code, loader: 'js' };
    });
  },
});

function printDiagnostics(...args: any[]) {
  console.log(inspect(args, false, 10, true));
}

export function getSwcPlugin(options: Required<PkgxOptions>) {
  return swcPlugin(options);
}

import { transform } from '@swc/core';
import type { Plugin } from 'rollup';

import type { PkgxOptions } from '@libs/pkgx-plugin-devkit';

export function getSwcPlugin(options: Required<PkgxOptions>): Plugin {
  return {
    name: 'swc',
    transform(code, id) {
      if (id.startsWith(`\0`)) {
        return null;
      }

      return transform(code, {
        jsc: {
          target: 'esnext',
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
          loose: true,
        },
        sourceMaps: true,
      });
    },
  };
}

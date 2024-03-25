import type { Plugin } from 'esbuild';

import {
  OutputType,
  parseTsconfigJsonFiles,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

const nodeResolvePlugin: (options: {
  excludeFromExternal: (string | RegExp)[];
}) => Plugin = (options) => ({
  name: 'node-resolve',
  setup(build) {
    build.onResolve({ filter: /.*/ }, async (args) => {
      const path = args.path;

      if (
        path.startsWith('/') ||
        path.startsWith('./') ||
        path.startsWith('../') ||
        path === '.' ||
        path === '..'
      ) {
        return null;
      }

      for (const e of options.excludeFromExternal) {
        if (typeof e === 'string') {
          if (path === e) {
            return null;
          }
        } else {
          if (e.test(path)) {
            return null;
          }
        }
      }

      return {
        path: args.path,
        external: true,
      };
    });
  },
});

export async function getNodeResolvePlugin(
  type: OutputType,
  options: Required<PkgxOptions>,
) {
  const { tsconfigJson, wspTsconfigJson } = await parseTsconfigJsonFiles(
    process.cwd(),
  );

  const paths =
    tsconfigJson?.compilerOptions?.paths ??
    wspTsconfigJson?.compilerOptions?.paths;

  const excludeFromExternal = [
    ...options.excludeFromExternal,
    ...(type === OutputType.CJS ? options.cjsExcludeFromExternal : []),
    ...Object.keys(paths || {}).map(
      (o) => new RegExp('^' + o.replace('*', '(.*)')),
    ),
  ];

  return nodeResolvePlugin({ excludeFromExternal });
}

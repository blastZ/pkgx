import { resolve } from 'node:path';

import alias from '@rollup/plugin-alias';
import { type InputPluginOption } from 'rollup';

import {
  parseTsconfigJsonFiles,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

export async function getSwcAliasPlugin(
  options: Required<PkgxOptions>,
): Promise<InputPluginOption> {
  const { wspDir, tsconfigJson, wspTsconfigJson } =
    await parseTsconfigJsonFiles(process.cwd());

  let baseUrl: string | undefined;
  if (tsconfigJson?.compilerOptions?.baseUrl) {
    baseUrl = resolve(process.cwd(), tsconfigJson.compilerOptions.baseUrl);
  } else if (wspTsconfigJson?.compilerOptions?.baseUrl) {
    baseUrl = resolve(wspDir, wspTsconfigJson.compilerOptions.baseUrl);
  }

  const paths =
    tsconfigJson?.compilerOptions?.paths ??
    wspTsconfigJson?.compilerOptions?.paths;

  return (alias as unknown as typeof alias.default)({
    entries: [
      ...Object.entries(paths || {}).map(([from, toList]) => {
        const find = from.includes('*')
          ? new RegExp('^' + from.replace('*', '(.*)'))
          : from;
        const replacement = resolve(
          baseUrl || process.cwd(),
          toList[0],
        ).replace('*', '$1');

        return {
          find,
          replacement,
        };
      }),
      ...Object.entries(options.alias).map(([origin, target]) => {
        return {
          find: origin,
          replacement: resolve(process.cwd(), target),
        };
      }),
    ],
  });
}

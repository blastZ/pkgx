import { resolve } from 'node:path';

import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';
import { type InputPluginOption, type RollupOptions } from 'rollup';

import {
  TSCONFIG_FILE_NAME,
  WSP_TSCONFIG_FILE_NAME,
  getRootDirFromTsconfig,
  readTsconfigJsonFile,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

export async function getSwcEsmOutput(options: Required<PkgxOptions>) {
  const outputDir = `${options.outputDirName}/esm`;

  const plugins: InputPluginOption = [];

  plugins.push(
    nodeResolve({
      exportConditions: ['node'],
      preferBuiltins: true,
      extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
    }),
  );

  const tsconfigJson = await readTsconfigJsonFile(
    resolve(process.cwd(), TSCONFIG_FILE_NAME),
  );
  const rootDir = await getRootDirFromTsconfig(process.cwd());
  const rootTsconfigJson = await readTsconfigJsonFile(
    resolve(rootDir, WSP_TSCONFIG_FILE_NAME),
  );

  let baseUrl: string | undefined;
  if (tsconfigJson?.compilerOptions?.baseUrl) {
    baseUrl = resolve(process.cwd(), tsconfigJson.compilerOptions.baseUrl);
  } else if (rootTsconfigJson?.compilerOptions?.baseUrl) {
    baseUrl = resolve(rootDir, rootTsconfigJson.compilerOptions.baseUrl);
  }

  const paths =
    tsconfigJson?.compilerOptions?.paths ??
    rootTsconfigJson?.compilerOptions?.paths;

  plugins.push(
    (alias as unknown as typeof alias.default)({
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
    }),
  );

  plugins.push(
    (swc as unknown as typeof swc.default)({
      swc: {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          target: 'esnext',
        },
      },
    }),
  );

  const output: RollupOptions = {
    input: `${options.inputDir}/${options.esmInputFileName}`,
    output: [
      {
        file: `${outputDir}/index.js`,
        format: 'esm',
        sourcemap: options.sourceMap,
        inlineDynamicImports: true,
      },
    ],
    plugins,
    external: options.external,
    cache: options.cache,
  };

  return output;
}

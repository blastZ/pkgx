import { resolve } from 'node:path';

import { globby } from 'globby';

import {
  __dirname,
  readJsonFile,
  type PkgxPluginDefinition,
} from '@libs/pkgx-plugin-devkit';

export async function parsePlugins() {
  const plugins = await globby(
    resolve(__dirname, '../libs/pkgx-plugin-*/pkgx.plugin.json'),
  );

  const definitions = await Promise.all(
    plugins.map(
      async (plugin) => await readJsonFile<PkgxPluginDefinition>(plugin),
    ),
  );

  return definitions;
}

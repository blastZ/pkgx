import { resolve } from 'node:path';

import { globby } from 'globby';

import {
  __dirname,
  printDiagnostics,
  readJsonFile,
  type PkgxPluginDefinition,
} from '@libs/pkgx-plugin-devkit';

const scope = '@pkgx/core';
const namespace = ['utils', 'load-plugin-definitions.util.ts'];

async function _loadPluginDefinitions(pattern: string) {
  const plugins = await globby(pattern);

  printDiagnostics(scope, namespace, { pattern, plugins });

  const definitions = await Promise.all(
    plugins.map(
      async (plugin) => await readJsonFile<PkgxPluginDefinition>(plugin),
    ),
  );

  return definitions;
}

async function loadUserPluginDefinitions() {
  return [];
}

async function loadInternalPluginDefinitions() {
  const definitions = await _loadPluginDefinitions(
    resolve(__dirname, '../libs/pkgx-plugin-*/pkgx.plugin.json'),
  );

  return definitions;
}

export async function loadPluginDefinitions() {
  return [
    ...(await loadInternalPluginDefinitions()),
    ...(await loadUserPluginDefinitions()),
  ];
}

import { resolve } from 'node:path';

import { globby } from 'globby';

import type { PkgxWorkspaceOptions } from '../interfaces/pkgx-workspace-options.interface.js';

export const DEFAULT_WORKSPACE_CONFIG_BASE = 'pkgx.workspace';

export async function readPkgxWorkspaceConfigFile(): Promise<PkgxWorkspaceOptions> {
  const paths = await globby(`${DEFAULT_WORKSPACE_CONFIG_BASE}.{js,mjs,cjs}`);

  if (paths.length < 1) {
    return {};
  }

  const config = (await import(resolve('.', paths[0]))).default;

  return config;
}

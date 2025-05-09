import { resolve } from 'node:path';

import type { PkgxWorkspaceOptions } from '../interfaces/pkgx-workspace-options.interface.js';

import { loadEsModule } from './load-es-module.util.js';
import { matchPaths } from './match-paths.util.js';

export const DEFAULT_WORKSPACE_CONFIG_BASE = 'pkgx.workspace';

export async function readPkgxWorkspaceConfigFile(): Promise<PkgxWorkspaceOptions> {
  const paths = await matchPaths(
    `${DEFAULT_WORKSPACE_CONFIG_BASE}.{js,mjs,cjs}`,
  );

  if (paths.length < 1) {
    return {};
  }

  const config = (await loadEsModule(resolve('.', paths[0]))).default;

  return config;
}

import { pathToFileURL } from 'node:url';

import { program } from 'commander';

export async function loadEsModule(path: string) {
  const moduleUrl = pathToFileURL(path).href;

  const module = await import(moduleUrl).catch((err) => {
    throw program.error(
      `Error [ERR_LOAD_ES_MODULE]: load '${moduleUrl}' failed, ${err.message}`,
    );
  });

  return module;
}

import { readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import { $ } from 'zx';

import {
  changeWorkingDirectory,
  isPathAvailable,
  logger,
  printDiagnostics,
  type PkgJson,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';

async function readJsonFile<T = unknown>(path: string): Promise<T | null> {
  let jsonStr: string | null = null;

  try {
    jsonStr = (await readFile(path)).toString();
  } catch (err) {
    logger.error(`${path} not found`);

    jsonStr = null;
  }

  if (!jsonStr) {
    return null;
  }

  let json: T | null = null;

  try {
    json = JSON.parse(jsonStr);
  } catch (err) {
    logger.error(`${path} is not a valid JSON file`);

    json = null;
  }

  return json;
}

export class CpLibExecutor {
  constructor(private context: PkgxContext) {}

  async run() {
    const [originalPath, targetPath] = this.context.cmdArguments;

    const libPath = resolve(process.cwd(), originalPath);
    const libName = basename(libPath);

    const libPackageJsonFile = await readJsonFile<PkgJson>(
      resolve(libPath, 'package.json'),
    );

    if (!libPackageJsonFile) {
      return;
    }

    const appPath = resolve(process.cwd(), targetPath);

    const appPackageJsonFile = await readJsonFile<PkgJson>(
      resolve(appPath, 'package.json'),
    );

    if (!appPackageJsonFile) {
      return;
    }

    const workspacePath = resolve(appPath, '../../');
    const libsPath = resolve(appPath, '../../libs');
    const targetLibPath = resolve(libsPath, libName);

    const isLibExists = await isPathAvailable(targetLibPath);

    printDiagnostics('@pkgx/plugin-npm', ['executors', 'cp-lib', 'index.ts'], {
      originalPath,
      targetPath,
      libPath,
      libName,
      appPath,
      workspacePath,
      libsPath,
      targetLibPath,
      isLibExists,
    });

    const libDevDependencies = libPackageJsonFile.devDependencies || {};
    const appDependencies = appPackageJsonFile.dependencies || {};
    const appDevDependencies = appPackageJsonFile.devDependencies || {};

    Object.entries(libDevDependencies).map(([name, version]) => {
      if (name.startsWith('@types/')) {
        appDevDependencies[name] = version;
      } else {
        appDependencies[name] = version;
      }
    });

    appPackageJsonFile.dependencies = appDependencies;
    appPackageJsonFile.devDependencies = appDevDependencies;

    await writeFile(
      resolve(appPath, 'package.json'),
      JSON.stringify(appPackageJsonFile, null, 2),
    );

    await $`rm -rf ${targetLibPath}`;

    await $`cp -r ${libPath} ${libsPath}`;

    await changeWorkingDirectory(workspacePath);

    await $`pnpm install`;
  }
}

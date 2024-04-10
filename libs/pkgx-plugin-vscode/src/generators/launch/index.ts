import { basename, resolve } from 'node:path';

import { globby } from 'globby';
import { fs } from 'zx';

import {
  isPathAvailable,
  readPackageJsonFile,
  type PkgxContext,
} from '@libs/pkgx-plugin-devkit';

interface CmdOptions {
  overwrite?: boolean;
}

export class LaunchGenerator {
  constructor(private context: PkgxContext<CmdOptions>) {}

  async run() {
    const options = this.context.cmdOptions;

    const launchFilePath = resolve(process.cwd(), './.vscode/launch.json');

    const isLaunchExits = await isPathAvailable(launchFilePath);

    if (isLaunchExits && !options.overwrite) {
      throw new Error('launch.json already exists');
    }

    const appsFolderPath = resolve(process.cwd(), './apps');

    const isAppsFolderExists = await isPathAvailable(appsFolderPath);

    if (!isAppsFolderExists) {
      throw new Error('apps folder not found');
    }

    const appPaths = await globby(`${appsFolderPath}/*`, {
      onlyDirectories: true,
    });

    const data = {
      configurations: await Promise.all(
        appPaths.map(async (appPath) => {
          const pkgJson = await readPackageJsonFile(`${appPath}/package.json`);

          const appFolderName = basename(appPath);
          const name = pkgJson ? pkgJson.name : appFolderName;

          return {
            name,
            cwd: `\${workspaceFolder}/apps/${appFolderName}`,
            program: '.',
            request: 'launch',
            skipFiles: ['<node_internals>/**'],
            type: 'node',
            console: 'integratedTerminal',
            runtimeExecutable: 'pkgx',
            runtimeArgs: ['esbuild:serve'],
          };
        }),
      ),
    };

    await fs.createFile(launchFilePath);

    await fs.writeFile(launchFilePath, JSON.stringify(data, null, 2));
  }
}

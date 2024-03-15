import { resolve } from 'node:path';

import { PackageType } from '../enums/package-type.enum.js';
import { InternalOptions } from '../interfaces/internal-options.interface.js';
import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getPkgJson } from './get-pkg-json.util.js';
import { getRootDirFromTsconfig } from './get-root-dir-from-tsconfig.util.js';

async function _getPackageBasedExternal(
  pkgJsonDir: string,
  internalOptions: InternalOptions,
) {
  const pkgJson = await getPkgJson(pkgJsonDir, true);

  const dependencies = Object.keys(pkgJson.dependencies || {});
  const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

  const external: (string | RegExp)[] = dependencies.concat(peerDependencies);

  if (internalOptions.isTest) {
    const devDependecies = Object.keys(pkgJson.devDependencies || {});

    external.push(...devDependecies);
  }

  return external;
}

async function getPackageBasedExternal(internalOptions: InternalOptions) {
  const external: (string | RegExp)[] = [];

  const pkgExternal = await _getPackageBasedExternal(
    process.cwd(),
    internalOptions,
  );

  external.push(...pkgExternal, /^node:.+$/);

  const rootDir = await getRootDirFromTsconfig();
  const isWsp = rootDir !== process.cwd();

  if (isWsp) {
    const wspExternal = await _getPackageBasedExternal(
      rootDir,
      internalOptions,
    );

    external.push(...wspExternal);
  }

  return external;
}

async function getExternal(
  options: PkgxOptions,
  internalOptions: InternalOptions,
) {
  const packageBasedExternal = options.packageBasedExternal ?? true;
  const excludeFromExternal = options.excludeFromExternal || [];
  const cjsExcludeFromExternal = options.cjsExcludeFromExternal || [];

  let external = packageBasedExternal
    ? await getPackageBasedExternal(internalOptions)
    : [];

  external = external.concat(options.external || []);

  external = external.filter((o) => !excludeFromExternal.includes(o));

  const cjsExternal = external.filter(
    (o) => !cjsExcludeFromExternal.includes(o),
  );

  return { external, cjsExternal };
}

function getExclude(options: PkgxOptions, internalOptions: InternalOptions) {
  const exclude = ['node_modules', 'dist', 'output'];

  if (!internalOptions.isTest) {
    const rootTestDirs = [
      resolve(process.cwd(), './test'),
      resolve(process.cwd(), './tests'),
    ];

    const testDirPatterns = rootTestDirs.map((o) => o + '/**');

    exclude.push(...testDirPatterns, '**/*.spec.ts', '**/*.test.ts');
  }

  return exclude.concat(options.exclude || []);
}

async function getPackageType(options: PkgxOptions) {
  if (options.packageType) {
    return options.packageType;
  }

  const packageJson = await getPkgJson();

  if (!packageJson.type || packageJson.type === PackageType.Commonjs) {
    return PackageType.Commonjs;
  }

  return PackageType.Module;
}

export async function getFilledPkgxOptions(
  options: PkgxOptions,
  internalOptions: InternalOptions = {},
) {
  const inputFileName = options.inputFileName || 'index.ts';

  const { external, cjsExternal } = await getExternal(options, internalOptions);

  const filledOptions: Required<PkgxOptions> = {
    inputFileName,
    cjsInputFileName: options.cjsInputFileName || inputFileName,
    esmInputFileName: options.esmInputFileName || inputFileName,
    cliInputFileName: options.cliInputFileName || '',
    inputDir: options.inputDir || 'src',
    outputDirName: options.outputDirName || 'output',
    external,
    cjsExternal,
    packageBasedExternal: options.packageBasedExternal ?? true,
    excludeFromExternal: options.excludeFromExternal || [],
    cjsExcludeFromExternal: options.cjsExcludeFromExternal || [],
    assets: options.assets || [],
    exclude: getExclude(options, internalOptions),
    sourceMap: options.sourceMap ?? false,
    disableEsmOutput: options.disableEsmOutput ?? false,
    disableCjsOutput: options.disableCjsOutput ?? false,
    disableDtsOutput: options.disableDtsOutput ?? false,
    incremental: options.incremental ?? false,
    cache: false,
    addStartScript: false,
    customScripts: options.customScripts || {},
    esmShim: options.esmShim ?? false,
    watchExtra: options.watchExtra ?? [],
    alias: options.alias || {},
    serveEnvs: options.serveEnvs || {},
    packageType: await getPackageType(options),
  };

  if (
    internalOptions.isApp ||
    internalOptions.isServe ||
    internalOptions.isTest
  ) {
    if (filledOptions.packageType === PackageType.Module) {
      filledOptions.disableCjsOutput = true;
    } else {
      filledOptions.disableEsmOutput = true;
    }

    filledOptions.disableDtsOutput = true;
  }

  if (internalOptions.isApp) {
    filledOptions.addStartScript = true;
  }

  if (internalOptions.isServe || internalOptions.isTest) {
    filledOptions.sourceMap = true;

    filledOptions.cache = true;
  }

  return filledOptions;
}

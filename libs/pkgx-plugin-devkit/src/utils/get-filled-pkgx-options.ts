import { InternalOptions } from '../interfaces/internal-options.interface.js';
import { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { getPkgJson } from './get-pkg-json.util.js';

async function getPackageBasedExternal(internalOptions: InternalOptions) {
  const pkgJson = await getPkgJson();

  const dependencies = Object.keys(pkgJson.dependencies || {});
  const peerDependencies = Object.keys(pkgJson.peerDependencies || {});

  const external: (string | RegExp)[] = dependencies.concat(peerDependencies);

  if (internalOptions.isTest) {
    const devDependecies = Object.keys(pkgJson.devDependencies || {});

    external.push(...devDependecies);
  }

  external.push(/^node:.+$/);

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
    exclude.push('test', '**/*.spec.ts', '**/*.test.ts');
  }

  return exclude.concat(options.exclude || []);
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
  };

  if (
    internalOptions.isApp ||
    internalOptions.isServe ||
    internalOptions.isTest
  ) {
    filledOptions.disableCjsOutput = true;
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
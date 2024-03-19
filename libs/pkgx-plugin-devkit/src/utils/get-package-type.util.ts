import { PackageType } from '../enums/package-type.enum.js';

import { ParsePackageJsonPathsResult } from './parse-package-json-paths.util.js';
import { readPackageJsonFile } from './read-package-json-file.util.js';

export async function getPackageType(parseResult: ParsePackageJsonPathsResult) {
  const { isWsp, pkgJsonPath, wspPkgJsonPath } = parseResult;

  const pkgJson = await readPackageJsonFile(pkgJsonPath);
  const wspPkgJson = isWsp
    ? await readPackageJsonFile(wspPkgJsonPath)
    : undefined;

  if (pkgJson?.type === PackageType.Module) {
    return PackageType.Module;
  }

  if (isWsp && !pkgJson && wspPkgJson?.type === PackageType.Module) {
    return PackageType.Module;
  }

  return PackageType.Commonjs;
}

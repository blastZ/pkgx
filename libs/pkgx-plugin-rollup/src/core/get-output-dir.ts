import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

export function getOutputDir(type: OutputType, options: Required<PkgxOptions>) {
  if (type === OutputType.ESM) {
    return `${options.outputDirName}/esm`;
  }

  if (type === OutputType.CJS) {
    return `${options.outputDirName}/cjs`;
  }

  if (type === OutputType.BIN) {
    return `${options.outputDirName}/bin`;
  }

  throw new Error('Invalid output type');
}

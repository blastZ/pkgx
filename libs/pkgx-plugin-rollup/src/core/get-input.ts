import { OutputType, type PkgxOptions } from '@libs/pkgx-plugin-devkit';

export function getInput(type: OutputType, options: Required<PkgxOptions>) {
  let inputFileName = options.inputFileName;

  if (type === OutputType.ESM) {
    inputFileName = options.esmInputFileName;
  }

  if (type === OutputType.CJS) {
    inputFileName = options.cjsInputFileName;
  }

  if (type === OutputType.BIN) {
    inputFileName = options.cliInputFileName;
  }

  return `${options.inputDir}/${inputFileName}`;
}

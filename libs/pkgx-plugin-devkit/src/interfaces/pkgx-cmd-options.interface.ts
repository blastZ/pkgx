import type { PkgxOptions } from '../core/pkgx-options/index.js';

export type PkgxCmdOptions = Pick<
  PkgxOptions,
  'inputFileName' | 'inputDir' | 'sourceMap'
>;

import { PkgxOptions } from '@libs/pkgx-plugin-devkit';

export interface CmdOptions
  extends Pick<PkgxOptions, 'inputFileName' | 'inputDir'> {}

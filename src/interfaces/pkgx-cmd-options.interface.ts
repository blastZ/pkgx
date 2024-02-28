import { type PkgxOptions } from '@libs/pkgx-plugin-devkit';

export type PkgxCmdOptions = Pick<PkgxOptions, 'inputFileName' | 'inputDir'>;

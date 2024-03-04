import { PkgxOptions } from './pkgx-options.interface.js';

export interface PkgxContext<CmdOptions = Record<string, unknown>> {
  pkgxOptions: Required<PkgxOptions>;
  cmdArguments: string[];
  cmdOptions: CmdOptions;
}

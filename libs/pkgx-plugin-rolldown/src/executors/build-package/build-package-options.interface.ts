import type { PkgxCmdOptions } from '@libs/pkgx-plugin-devkit';

export interface BuildPackageOptions extends PkgxCmdOptions {
  pack?: boolean;
}

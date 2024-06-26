import type { CopyFilePattern } from '../../../interfaces/copy-file-pattern.interface.js';

export interface PkgxOptions {
  inputFileName?: string;
  cjsInputFileName?: string;
  esmInputFileName?: string;
  cliInputFileName?: string;
  inputDir?: string;
  outputDirName?: string;
  external?: (string | RegExp)[];
  cjsExternal?: (string | RegExp)[];
  packageBasedExternal?: boolean;
  excludeFromExternal?: (string | RegExp)[];
  cjsExcludeFromExternal?: (string | RegExp)[];
  assets?: (string | CopyFilePattern)[];
  exclude?: string[];
  sourceMap?: boolean;
  packageType?: 'module' | 'commonjs';
  disableEsmOutput?: boolean;
  disableCjsOutput?: boolean;
  disableDtsOutput?: boolean;
  incremental?: boolean;
  cache?: boolean;
  addStartScript?: boolean;
  customScripts?: Record<string, string>;
  esmShim?: boolean;
  watchExtra?: string[];
  alias?: Record<string, string>;
  serveEnvs?: Record<string, string>;
  skipTypeCheck?: boolean;
  skipTypeCheckOnServe?: boolean;
  replaceValues?: Record<string, string>;
}

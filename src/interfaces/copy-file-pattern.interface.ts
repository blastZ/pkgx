import { type Options as GlobOptions } from 'globby';
import { type fs } from 'zx';

export interface CopyFilePattern {
  src: string;
  dest: string;
  options?: fs.CopyOptions;
  globOptions?: GlobOptions;
}

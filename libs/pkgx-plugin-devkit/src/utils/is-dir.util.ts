import { parse } from 'node:path';

export async function isDir(filePath: string) {
  if (filePath.endsWith('/')) {
    return true;
  }

  const { ext } = parse(filePath);

  if (!ext) {
    return true;
  }

  return false;
}

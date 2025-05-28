import { stat } from 'node:fs/promises';

export async function isDir(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);

    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

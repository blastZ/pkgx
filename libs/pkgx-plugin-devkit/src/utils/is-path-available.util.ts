import { access, constants } from 'node:fs/promises';

export async function isPathAvailable(path: string) {
  try {
    await access(path, constants.R_OK | constants.W_OK);

    return true;
  } catch (err) {
    return false;
  }
}

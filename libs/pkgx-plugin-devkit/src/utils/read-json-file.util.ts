import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

import { chalk } from 'zx';

import { logger } from './logger.util.js';

const parsedMap = new Map<string, unknown>();

export async function readJsonFile<T>(path: string): Promise<T> {
  const parsed = parsedMap.get(path);

  if (parsed) {
    return parsed as T;
  }

  let jsonStr: string;

  try {
    jsonStr = (await readFile(path)).toString();
  } catch (err) {
    logger.warn(
      chalk.yellow(
        chalk.bold(`${basename(path)} not found, using default values.`),
      ),
    );

    jsonStr = '{}';
  }

  let json: T;

  try {
    json = JSON.parse(jsonStr);
  } catch (err) {
    logger.warn(
      chalk.yellow(
        chalk.bold(
          `${basename(path)} is not a valid JSON file, using default values.`,
        ),
      ),
    );

    json = {} as T;
  }

  parsedMap.set(path, json);

  return json;
}

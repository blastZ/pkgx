import { writeFile } from 'node:fs/promises';

import { chalk } from 'zx';

import { DEFAULT_CONFIG_BASE, logger } from '@libs/pkgx-plugin-devkit';

import { getFileNameByExtensions } from '../../utils/get-file-name-by-extensions.util.js';

const CONFIG_TEMPLATE = `
/**
 * @type {import('@blastz/pkgx').PkgxOptions}
 */
export default {};
`;

export class ConfigGenerator {
  async isConfigFileExists() {
    const fileName = await getFileNameByExtensions('.', DEFAULT_CONFIG_BASE);

    if (!fileName) {
      return false;
    }

    return true;
  }

  async run() {
    const isConfigFileExists = await this.isConfigFileExists();

    if (isConfigFileExists) {
      logger.error('config file already exists');

      return;
    }

    await writeFile('pkgx.config.js', CONFIG_TEMPLATE.slice(1));

    logger.info(chalk.green(`create pkgx.config.js successfully`));
  }
}

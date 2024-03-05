import { Command } from 'commander';
import { cd, chalk } from 'zx';

import { logger } from '@libs/pkgx-plugin-devkit';

import { parsePlugins, PluginHelper } from '@/utils';

import { ConfigGenerator } from '../generators/config/index.js';

async function generateResourceByPlugin(generator: string) {
  const plugins = await parsePlugins();

  const pluginHelper = new PluginHelper(plugins);

  const { pluginName, generatorName } =
    pluginHelper.parseGeneratorName(generator);

  logger.info(
    `run generator ${chalk.underline(`${pluginName}:${generatorName}`)}`,
  );

  await pluginHelper.runGenerator(pluginName, generatorName);
}

async function generateResource(generator: string, relativePath: string) {
  cd(relativePath);

  if (generator === 'config') {
    await new ConfigGenerator().run();

    return;
  }

  await generateResourceByPlugin(generator);
}

export function createGenerateCommand() {
  const generate = new Command('generate')
    .alias('g')
    .argument(
      '<generator>',
      'name of the generator e.g., @pkgx/docker:dockerfile, dockerfile',
    )
    .argument('<relative-path>', 'relative path to run the generator')
    .description('generate resources')
    .action(generateResource);

  return generate;
}

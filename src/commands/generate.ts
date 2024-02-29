import { resolve } from 'path';

import { Command, program } from 'commander';
import { cd } from 'zx';

import { __dirname, type PkgxPluginDefinition } from '@libs/pkgx-plugin-devkit';

import { parsePlugins } from '@/utils';

import { ConfigGenerator } from '../generators/config/index.js';

function parseInputGenerator(generator: string): [string | null, string] {
  if (!generator) {
    throw program.error('generator not provided');
  }

  if (generator.includes(':')) {
    const [pluginName, generatorName] = generator.split(':');

    if (!pluginName || !generatorName) {
      throw program.error(`invalid generator "${generator}"`);
    }

    return [pluginName, generatorName];
  }

  return [null, generator];
}

function getPlugin(plugins: PkgxPluginDefinition[], pluginName: string) {
  const plugin = plugins.find((o) => o.name === pluginName);

  if (!plugin) {
    throw program.error('plugin not found');
  }

  return plugin;
}

async function getPluginModule(plugin: PkgxPluginDefinition) {
  const pluginModule = await import(
    resolve(
      __dirname,
      `../libs/${plugin.name.replace('@pkgx/', 'pkgx-plugin-')}/esm/index.js`,
    )
  );

  if (!pluginModule) {
    throw program.error('plugin module not found');
  }

  return pluginModule;
}

function getGenerator(plugin: PkgxPluginDefinition, generatorName: string) {
  const key = Object.keys(plugin.generators).find((k) => {
    if (k === generatorName) {
      return true;
    }

    if (plugin.generators[k].aliases?.includes(generatorName)) {
      return true;
    }

    return false;
  });

  if (!key) {
    throw program.error('generator not found');
  }

  return plugin.generators[key];
}

function getGeneratorInAllPlugins(
  plugins: PkgxPluginDefinition[],
  generatorName: string,
) {
  let targetGeneratorName = generatorName;

  const plugin = plugins.find((o) => {
    if (o.generators[generatorName]) {
      return true;
    }

    const key = Object.keys(o.generators).find((k) =>
      o.generators[k].aliases?.includes(generatorName),
    );

    if (key) {
      targetGeneratorName = key;

      return true;
    }

    return false;
  });

  if (!plugin) {
    throw program.error('generator not found');
  }

  return { plugin, generator: plugin.generators[targetGeneratorName] };
}

async function runGenerator(
  plugin: PkgxPluginDefinition,
  generator: PkgxPluginDefinition['generators'][string],
) {
  const pluginModule = await getPluginModule(plugin);

  const factory = new pluginModule[generator.factory]();

  await factory.run();
}

async function generateResourceByPlugin(generator: string) {
  const plugins = await parsePlugins();

  const [pluginName, generatorName] = parseInputGenerator(generator);

  if (pluginName) {
    const plugin = getPlugin(plugins, pluginName);

    const generator = getGenerator(plugin, generatorName);

    await runGenerator(plugin, generator);
  } else {
    const { plugin, generator } = getGeneratorInAllPlugins(
      plugins,
      generatorName,
    );

    await runGenerator(plugin, generator);
  }
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

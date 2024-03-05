import { resolve } from 'node:path';

import { program } from 'commander';

import {
  PkgxContext,
  PkgxPluginDefinition,
  __dirname,
} from '@libs/pkgx-plugin-devkit';

type TargetType = 'generator' | 'executor';

export class PluginHelper {
  constructor(private plugins: PkgxPluginDefinition[]) {}

  private findTargetNameInAllPlugins(type: TargetType, targetName: string) {
    let fullTargetName = targetName;

    const t = (type + 's') as 'generators' | 'executors';

    const plugin = this.plugins.find((o) => {
      const ot = o[t];

      if (!ot) {
        return false;
      }

      if (ot[targetName]) {
        return true;
      }

      const key = Object.keys(ot).find((k) =>
        ot[k].aliases?.includes(targetName),
      );

      if (key) {
        fullTargetName = key;

        return true;
      }

      return false;
    });

    if (!plugin) {
      throw program.error(`${type} not found`);
    }

    return { pluginName: plugin.name, targetName: fullTargetName };
  }

  private findTargetNameInSpecificPlugin(
    type: TargetType,
    pluginName: string,
    targetName: string,
  ) {
    let fullTargetName = targetName;

    const plugin = this.plugins.find((o) => o.name === pluginName);

    if (!plugin) {
      throw program.error('plugin not found');
    }

    const t = (type + 's') as 'generators' | 'executors';

    const pt = plugin[t];

    if (!pt) {
      throw program.error(`${type} not found`);
    }

    const targetKeys = Object.keys(pt);

    const key = targetKeys.find((k) => {
      if (k === targetName) {
        return true;
      }

      if (pt[k].aliases?.includes(targetName)) {
        fullTargetName = k;

        return true;
      }

      return false;
    });

    if (!key) {
      throw program.error(`${type} not found`);
    }

    return { pluginName, targetName: fullTargetName };
  }

  private completeName(name: string) {
    if (name.startsWith('@')) {
      return name;
    }

    if (['build', 'serve'].includes(name)) {
      return `@pkgx/rollup:${name}`;
    }

    if (name.includes(':') && !name.startsWith('@')) {
      return `@pkgx/${name}`;
    }

    return name;
  }

  private parseInputName(type: TargetType, inputName: string) {
    if (!inputName) {
      throw program.error(`${type} not provided`);
    }

    const name = this.completeName(inputName);

    if (name.includes(':')) {
      const [pluginName, targetName] = name.split(':');

      if (!pluginName || !targetName) {
        throw program.error(`invalid ${type} "${name}"`);
      }

      return this.findTargetNameInSpecificPlugin(type, pluginName, targetName);
    }

    return this.findTargetNameInAllPlugins(type, name);
  }

  parseGeneratorName(inputName: string) {
    const { pluginName, targetName } = this.parseInputName(
      'generator',
      inputName,
    );

    return { pluginName, generatorName: targetName };
  }

  parseExecutorName(inputName: string) {
    const { pluginName, targetName } = this.parseInputName(
      'executor',
      inputName,
    );

    return {
      pluginName,
      executorName: targetName,
    };
  }

  getPlugin(pluginName: string) {
    const plugin = this.plugins.find((o) => o.name === pluginName);

    if (!plugin) {
      throw program.error('plugin not found');
    }

    return plugin;
  }

  getGenerator(pluginName: string, generatorName: string) {
    const plugin = this.getPlugin(pluginName);

    const generator = plugin.generators?.[generatorName];

    if (!generator) {
      throw program.error('generator not found');
    }

    return generator;
  }

  getExecutor(pluginName: string, executorName: string) {
    const plugin = this.getPlugin(pluginName);

    const executor = plugin.executors?.[executorName];

    if (!executor) {
      throw program.error('executor not found');
    }

    return executor;
  }

  private async loadPluginModule(pluginName: string) {
    const plugin = this.getPlugin(pluginName);

    if (!plugin) {
      throw program.error('plugin not found');
    }

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

  async runGenerator(pluginName: string, generatorName: string) {
    const generator = this.getGenerator(pluginName, generatorName);

    const pluginModule = await this.loadPluginModule(pluginName);

    if (!pluginModule[generator.factory]) {
      throw program.error('generator factory not found');
    }

    const factory = new pluginModule[generator.factory]();

    await factory.run();
  }

  async runExecutor(
    pluginName: string,
    generatorName: string,
    context: PkgxContext,
  ) {
    const executor = this.getExecutor(pluginName, generatorName);

    const pluginModule = await this.loadPluginModule(pluginName);

    if (!pluginModule[executor.factory]) {
      throw program.error('executor factory not found');
    }

    const factory = new pluginModule[executor.factory](context);

    await factory.run();
  }
}

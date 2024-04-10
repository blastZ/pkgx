import { chalk } from 'zx';

import {
  changeWorkingDirectory,
  logger,
  printDiagnostics,
} from '@libs/pkgx-plugin-devkit';

import { Command, parsePlugins, PluginHelper } from '@/utils';

import { ConfigGenerator } from '../generators/config/index.js';

async function generate(
  inputGenerator: string,
  relativePath: string,
  options: { verbose: boolean },
  cmd: Command,
) {
  const diagnostics = ['@pkgx/core::generate'];

  if (options.verbose) {
    process.env.PKGX_VERBOSE = '1';
  }

  printDiagnostics(...diagnostics, {
    inputGenerator,
    relativePath,
    options,
    args: cmd.args,
  });

  await changeWorkingDirectory(relativePath);

  if (inputGenerator === 'config') {
    await new ConfigGenerator().run();

    return;
  }

  const plugins = await parsePlugins();

  const pluginHelper = new PluginHelper(plugins);

  const { pluginName, generatorName } =
    pluginHelper.parseGeneratorName(inputGenerator);

  const command = new Command(`${pluginName}:${generatorName}`);

  const generator = pluginHelper.getGenerator(pluginName, generatorName);

  command.action(async (...args: any[]) => {
    logger.info(
      `generator ${chalk.underline(`${pluginName}:${generatorName}`)}`,
    );

    const cmdArguments: any = [];
    const cmdOptions: any = args.at(-2) || {};

    printDiagnostics(...diagnostics, { cmdArguments, cmdOptions });

    await pluginHelper.runGenerator(pluginName, generatorName, {
      cmdArguments,
      cmdOptions,
    });
  });

  generator.cmd?.options?.forEach((opt) => {
    command.option(opt.flags, opt.description, opt.defaultValue);
  });

  command.parse(cmd.args.slice(2), { from: 'user' });
}

export function createGenerateCommand() {
  const generateCommand = new Command('generate')
    .alias('g')
    .argument(
      '<generator>',
      'name of the generator e.g., @pkgx/docker:dockerfile, dockerfile',
    )
    .argument('<relative-path>', 'relative path to run the generator')
    .option('--verbose', 'show debug logs', false)
    .allowUnknownOption()
    .description('generate resources')
    .action(generate);

  return generateCommand;
}

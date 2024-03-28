import { program } from 'commander';
import { chalk } from 'zx';

import { logger, printDiagnostics } from '@libs/pkgx-plugin-devkit';

import { Command, PluginHelper, parsePlugins } from '@/utils';

async function run(
  inputExecutor: string,
  userArgs: string[],
  options: { verbose: boolean },
) {
  const diagnostics = ['@pkgx/core::run'];

  if (options.verbose) {
    process.env.PKGX_VERBOSE = '1';
  }

  printDiagnostics(...diagnostics, { inputExecutor, userArgs, options });

  const plugins = await parsePlugins();

  const pluginHelper = new PluginHelper(plugins);

  const { pluginName, executorName } =
    pluginHelper.parseExecutorName(inputExecutor);

  const command = new Command(`${pluginName}:${executorName}`);

  const executor = pluginHelper.getExecutor(pluginName, executorName);

  command.action(async (...args: any[]) => {
    logger.info(chalk.underline(`${pluginName}:${executorName}`));

    let cmdArguments;
    let cmdOptions;
    if (executor.cmd?.passThrough) {
      cmdArguments = args.at(-1).args;
      cmdOptions = {};
    } else {
      cmdArguments = args.slice(0, -2);
      cmdOptions = args.at(-2) || {};
    }

    await pluginHelper.runExecutor(pluginName, executorName, {
      cmdArguments,
      cmdOptions,
    });
  });

  executor.cmd?.arguments?.forEach((arg) => {
    if (typeof arg === 'string') {
      if (arg === '<relative-path>') {
        command.argument(arg, 'relative path to package root folder');
      } else {
        throw program.error(`Invalid argument: ${arg}`);
      }
    } else {
      command.argument(arg.flags, arg.description);
    }
  });

  executor.cmd?.options?.forEach((opt) => {
    command.option(opt.flags, opt.description, opt.defaultValue);
  });

  if (executor.cmd?.includePkgxOptions) {
    command.option('--input-file-name <inputFileName>', 'input file name');
    command.option('--input-dir <inputDir>', 'input directory');
  }

  if (executor.cmd?.passThrough) {
    command.allowExcessArguments();
    command.allowUnknownOption();
  }

  command.parse(userArgs, { from: 'user' });
}

export function createRunCommand() {
  const runCommand = new Command('run')
    .argument(
      '<executor>',
      'name of the executor e.g., @pkgx/rollup:build, build',
    )
    .argument('[args...]', 'any arguments for the executor')
    .option('--verbose', 'show debug logs', false)
    .allowUnknownOption()
    .action(run);

  return runCommand;
}

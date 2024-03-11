import { chalk } from 'zx';

import { logger } from '@libs/pkgx-plugin-devkit';

import { Command, PluginHelper, parsePlugins } from '@/utils';

async function run(inputExecutor: string, userArgs: string[]) {
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
    command.argument(arg.flags, arg.description);
  });

  executor.cmd?.options?.forEach((opt) => {
    command.option(opt.flags, opt.description, opt.defaultValue);
  });

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
    .allowUnknownOption()
    .action(run);

  return runCommand;
}

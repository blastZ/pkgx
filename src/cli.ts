#!/usr/bin/env node

import { program } from 'commander';

import {
  createBuildCommand,
  generateConfigCommand,
  generateDockerCommand,
  publishCommand,
  replaceModuleSuffixCommand,
  serveAppCommand,
  serveStaticCommand,
  testCommand,
} from '@/commands';
import {
  addPackageRelativePathArg,
  addPkgxCmdOptions,
  getCliVersion,
  logger,
} from '@/utils';

program.version(getCliVersion(), '-v --version');

program.addCommand(createBuildCommand());

const serve = program.command('serve').description('serve resources');

const serveApp = serve
  .command('application', { isDefault: true })
  .alias('app')
  .description('serve application based package')
  .action(serveAppCommand);

const serveStatic = serve
  .command('static')
  .description('serve static based package')
  .option('-p, --port <port>', 'port to listen')
  .option('--cors', 'enable cors')
  .action(serveStaticCommand);

const test = program
  .command('test')
  .description('test package')
  .action(testCommand);

const publish = program
  .command('publish')
  .description('publish package')
  .action(publishCommand);

program
  .command('replace-module-suffix')
  .description('replace module suffix')
  .argument('<relative-path>', 'relative path to file or folder')
  .argument('<old-suffix>', 'old suffix')
  .argument('<new-suffix>', 'new suffix')
  .option('--index-dirs [indexDirs...]', 'replace suffix with index file path')
  .action(replaceModuleSuffixCommand);

const generate = program
  .command('generate')
  .alias('g')
  .description('generate resources');

const generateConfig = generate
  .command('config')
  .description('generate config file')
  .action(generateConfigCommand);

generate
  .command('docker')
  .description('generate docker file')
  .action(generateDockerCommand);

program.hook('preAction', () => {
  logger.logCliVersion();
});

addPackageRelativePathArg([
  serveApp,
  serveStatic,
  test,
  publish,
  generateConfig,
]);

addPkgxCmdOptions([serveApp, test, publish]);

program.configureOutput({
  writeErr: (str) => {
    if (str.startsWith('error: ')) {
      str = str.replace('error: ', '');
    }

    logger.error(str);
  },
});

program.parse();

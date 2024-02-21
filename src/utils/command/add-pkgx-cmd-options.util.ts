import { type Command } from 'commander';

export function addPkgxCmdOptions(commands: Command[]) {
  commands.forEach((command) => {
    command.option('--input-file-name <inputFileName>', 'input file name');
    command.option('--input-dir <inputDir>', 'input dir');
  });
}

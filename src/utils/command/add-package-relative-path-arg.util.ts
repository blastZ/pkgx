import { type Command } from 'commander';

export function addPackageRelativePathArg(commands: Command[]) {
  commands.map((command) => {
    command.argument('<pkg-relative-path>', 'relative path to pkg root folder');
  });
}

import { type Command } from 'commander';

import {
  DockerfileGenerator,
  DockerignoreGenerator,
} from '@libs/pkgx-plugin-docker';

async function generateDocker() {
  await new DockerfileGenerator().run();
  await new DockerignoreGenerator().run();
}

export function createGenerateDockerCommand(generateCommand: Command) {
  const command = generateCommand
    .command('docker')
    .description('generate docker file')
    .action(generateDocker);

  return command;
}

import { type Command } from 'commander';

import { DockerGenerator } from '../../generators/docker/generator.js';

async function generateDocker() {
  const generator = new DockerGenerator();

  await generator.generate();
}

export function createGenerateDockerCommand(generateCommand: Command) {
  const command = generateCommand
    .command('docker')
    .description('generate docker file')
    .action(generateDocker);

  return command;
}

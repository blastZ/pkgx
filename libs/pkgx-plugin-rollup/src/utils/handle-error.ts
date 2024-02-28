import { type RollupError } from 'rollup';
import { chalk } from 'zx';

export function handleError(error: RollupError, recover = false): void {
  const name = error.name || (error.cause as Error)?.name;
  const nameSection = name ? `${name}: ` : '';
  const pluginSection = error.plugin ? `(plugin ${error.plugin}) ` : '';
  const message = `${pluginSection}${nameSection}${error.message}`;

  const outputLines = [
    chalk.bold(chalk.red(`[!] ${chalk.bold(message.toString())}`)),
  ];

  outputLines.push('', '');

  process.stderr.write(outputLines.join('\n'));

  if (!recover) {
    process.exit(1);
  }
}

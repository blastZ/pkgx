import { type InputPluginOption, type RollupOptions } from 'rollup';

import {
  OutputType,
  printDiagnostics,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

import { getInput } from './get-input.js';
import { getGraphPlugin } from './plugins/get-graph-plugin.js';
import { getSwcAliasPlugin } from './swc-plugins/get-swc-alias-plugin.js';
import { getSwcNodeResolvePlugin } from './swc-plugins/get-swc-node-resolve-plugin.js';

export async function getGraphOutput(
  type: OutputType,
  options: Required<PkgxOptions>,
) {
  const diagnostics = ['@pkgx/rollup'];

  const plugins: InputPluginOption = [];

  plugins.push(getSwcNodeResolvePlugin());

  plugins.push(await getSwcAliasPlugin(options));

  plugins.push(await getGraphPlugin());

  plugins.push({
    name: 'transform-code',
    transform(code) {
      const importExportRegex = /import.*from.*;/g;
      const matches = code.match(importExportRegex);

      printDiagnostics(...diagnostics, { matches });

      let newCode = matches ? matches.join('\n') : '';

      newCode = newCode.replace(/import\s+type\s+.*;/g, '');

      newCode = newCode.replace(
        /import\s+((\w+,\s*)*){(.*)}\s+from(.*);/g,
        (_, g1, __, g3, g4) => {
          const imports = (g3 as string).split(',').map((s) => s.trim());

          const nonTypeImports = imports
            .filter((i) => !i.startsWith('type '))
            .join(', ');

          return nonTypeImports
            ? `import ${g1}{ ${nonTypeImports} } from ${g4};`
            : g1
              ? `import ${g1} from ${g4}`
              : `import ${g4}`;
        },
      );

      printDiagnostics(...diagnostics, { newCode });

      return {
        code: newCode,
      };
    },
  });

  const output: RollupOptions = {
    input: getInput(type, options),
    plugins,
    external: type === OutputType.CJS ? options.cjsExternal : options.external,
    cache: options.cache,
    logLevel: 'silent',
  };

  return output;
}

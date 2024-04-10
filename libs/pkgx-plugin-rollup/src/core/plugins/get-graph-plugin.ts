import { resolve } from 'node:path';
import { inspect } from 'node:util';

import type { InputPluginOption } from 'rollup';

import {
  PackageType,
  printDiagnostics,
  type PkgxOptions,
} from '@libs/pkgx-plugin-devkit';

function getId(path: string) {
  const appsPath = resolve(process.cwd(), '../../apps');
  const libsPath = resolve(process.cwd(), '../../libs');

  if (path.startsWith(appsPath)) {
    const id = path.replace(appsPath, '').split('/')[1];

    return `@apps/${id}`;
  }

  if (path.startsWith(libsPath)) {
    const id = path.replace(libsPath, '').split('/')[1];

    return `@libs/${id}`;
  }

  return path;
}

function isExternal(options: Required<PkgxOptions>, id: string) {
  const external =
    options.packageType === PackageType.Commonjs
      ? options.cjsExternal
      : options.external;

  for (const o of external) {
    if (typeof o === 'string') {
      if (id === o) {
        return true;
      }
    } else if (o instanceof RegExp) {
      if (o.test(id)) {
        return true;
      }
    }
  }

  return false;
}

function getTargetGraph(
  targetId: string,
  graph: Map<string, Set<string>>,
  visited: string[] = [],
) {
  if (visited.includes(targetId)) {
    return 'CIRCULAR_DEPENDENCY';
  }

  visited.push(targetId);

  const map = new Map<string, any>();

  const target = graph.get(targetId);

  if (!target) {
    return map;
  }

  for (const id of target) {
    const next = getTargetGraph(id, graph, [...visited]);

    map.set(id, next);
  }

  return map;
}

export function getGraphPlugin(
  options: Required<PkgxOptions>,
): InputPluginOption {
  const diagnostics = ['@pkgx/rollup::getGraphPlugin'];

  return {
    name: 'graph',
    transform(code) {
      const importExportRegex = /import.*from.*;/g;
      const matches = code.match(importExportRegex);

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

      return {
        code: newCode,
      };
    },
    generateBundle() {
      const ids = Array.from(this.getModuleIds());

      const map = new Map<string, readonly string[]>();

      for (const id of ids) {
        const module = this.getModuleInfo(id);

        if (module && !module.isExternal) {
          map.set(id, module.importedIds);
        }
      }

      const graph = new Map<string, Set<string>>();

      for (const key of map.keys()) {
        const id = getId(key);

        const importedIds = map.get(key)?.map((id) => getId(id));

        if (!graph.has(id)) {
          graph.set(id, new Set());
        }

        const set = graph.get(id);

        if (importedIds) {
          for (const importedId of importedIds) {
            if (importedId === id) {
              continue;
            }

            if (isExternal(options, importedId)) {
              continue;
            }

            set?.add(importedId);
          }
        }
      }

      const targetGraph = getTargetGraph(getId(process.cwd()), graph);

      printDiagnostics(...diagnostics, graph);

      console.log(inspect(targetGraph, false, 10, true));
    },
  };
}

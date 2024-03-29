import type { InputPluginOption } from 'rollup';

export function getGraphPlugin(): InputPluginOption {
  return {
    name: 'graph',
    generateBundle() {
      const ids = Array.from(this.getModuleIds());

      const map = new Map<string, readonly string[]>();

      for (const id of ids) {
        const module = this.getModuleInfo(id);

        if (module) {
          map.set(id, module.importedIds);
        }
      }

      console.log(map);
    },
  };
}

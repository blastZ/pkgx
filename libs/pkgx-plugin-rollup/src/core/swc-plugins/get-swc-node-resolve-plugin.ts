import { nodeResolve } from '@rollup/plugin-node-resolve';
import { type InputPluginOption } from 'rollup';

export function getSwcNodeResolvePlugin(): InputPluginOption {
  return nodeResolve({
    exportConditions: ['node'],
    preferBuiltins: true,
    extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
  });
}

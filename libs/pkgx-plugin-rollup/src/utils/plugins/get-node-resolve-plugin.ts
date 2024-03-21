import {
  nodeResolve,
  type RollupNodeResolveOptions,
} from '@rollup/plugin-node-resolve';
import { type InputPluginOption } from 'rollup';

export function getNodeResolvePlugin(): InputPluginOption {
  const resolveOptions: RollupNodeResolveOptions = {
    exportConditions: ['node'],
    preferBuiltins: true,
  };

  return nodeResolve(resolveOptions);
}

import esmShim from '@rollup/plugin-esm-shim';
import { type InputPluginOption } from 'rollup';

export function getEsmShimPlugin(): InputPluginOption {
  return (esmShim as unknown as typeof esmShim.default)();
}

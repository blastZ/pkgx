import json from '@rollup/plugin-json';
import { type InputPluginOption } from 'rollup';

export function getJsonPlugin(): InputPluginOption {
  return (json as unknown as typeof json.default)();
}

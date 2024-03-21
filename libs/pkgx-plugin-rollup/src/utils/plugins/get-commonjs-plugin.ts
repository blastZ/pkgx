import commonjs from '@rollup/plugin-commonjs';
import { type InputPluginOption } from 'rollup';

export function getCommonjsPlugin(): InputPluginOption {
  return (commonjs as unknown as typeof commonjs.default)();
}

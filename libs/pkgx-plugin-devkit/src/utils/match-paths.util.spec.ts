import { win32 } from 'node:path';

import { describe, expect, it } from 'vitest';

import { pathToGlobPattern } from './match-paths.util.js';

describe('pathToGlobPattern', () => {
  it('should work with text', () => {
    const pattern = pathToGlobPattern('tsconfig.json');

    expect(pattern).toEqual('tsconfig.json');
  });

  it('should work with path', () => {
    const pattern = pathToGlobPattern('../tsconfig.*.json');

    expect(pattern).toEqual('../tsconfig.*.json');
  });

  it('should work with absolute path', () => {
    const pattern = pathToGlobPattern('/apps/test/tsconfig.*.json');

    expect(pattern).toEqual('/apps/test/tsconfig.*.json');
  });

  it('should work with win32', () => {
    const pattern = pathToGlobPattern(
      'E:\\apps\\test\\tsconfig.*.json',
      win32.sep,
    );

    expect(pattern).toEqual('E:/apps/test/tsconfig.*.json');
  });
});

import { parseTsconfigJsonFiles } from '@libs/pkgx-plugin-devkit';

export async function isTransformNeeded(cwd: string = process.cwd()) {
  const { tsconfigJson, wspTsconfigJson } = await parseTsconfigJsonFiles(cwd);

  if (
    !{ ...wspTsconfigJson, ...tsconfigJson }.compilerOptions
      ?.emitDecoratorMetadata
  ) {
    return false;
  }

  return true;
}

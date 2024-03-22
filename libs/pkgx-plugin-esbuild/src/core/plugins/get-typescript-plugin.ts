import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inspect } from 'node:util';

import type { Plugin } from 'esbuild';
import typescript from 'typescript';

const DEBUG = false;

const tscPlugin: () => Plugin = ({
  tsconfigPath = path.join(process.cwd(), './tsconfig.json'),
  force: forceTsc = false,
  tsx = true,
} = {}) => ({
  name: 'tsc',
  setup(build) {
    let parsedTsConfig: typescript.ParsedCommandLine | null = null;

    build.onLoad({ filter: tsx ? /\.tsx?$/ : /\.ts$/ }, async (args) => {
      if (!parsedTsConfig) {
        parsedTsConfig = parseTsConfig(tsconfigPath, process.cwd());

        if (parsedTsConfig.options.sourceMap) {
          parsedTsConfig.options.sourceMap = false;
          parsedTsConfig.options.inlineSources = true;
          parsedTsConfig.options.inlineSourceMap = true;
        }
      }

      if (
        !forceTsc &&
        (!parsedTsConfig ||
          !parsedTsConfig.options ||
          !parsedTsConfig.options.emitDecoratorMetadata)
      ) {
        return;
      }

      const ts = await readFile(args.path, 'utf8').catch((err) => {
        printDiagnostics({ file: args.path, err });

        throw new Error(`failed to read file: ${args.path}`);
      });

      if (DEBUG) {
        printDiagnostics(parsedTsConfig);
      }

      // Rewrite module NodeNext to ESNext, otherwise output module will be commonjs
      if (parsedTsConfig.options.module === 199) {
        parsedTsConfig.options.module = 99;
      }

      const program = typescript.transpileModule(ts, {
        compilerOptions: parsedTsConfig.options,
        fileName: path.basename(args.path),
      });

      if (DEBUG) {
        printDiagnostics(program.outputText);
      }

      return { contents: program.outputText };
    });
  },
});

function parseTsConfig(tsconfig?: string, cwd = process.cwd()) {
  const fileName = typescript.findConfigFile(
    cwd,
    typescript.sys.fileExists,
    tsconfig,
  );

  if (tsconfig !== undefined && !fileName) {
    throw new Error(`failed to open '${fileName}'`);
  }

  let loadedConfig = {};
  let baseDir = cwd;

  if (fileName) {
    const text = typescript.sys.readFile(fileName);

    if (text === undefined) {
      throw new Error(`failed to read '${fileName}'`);
    }

    const result = typescript.parseConfigFileTextToJson(fileName, text);

    if (result.error !== undefined) {
      printDiagnostics(result.error);

      throw new Error(`failed to parse '${fileName}'`);
    }

    loadedConfig = result.config;
    baseDir = path.dirname(fileName);
  }

  const parsedTsConfig = typescript.parseJsonConfigFileContent(
    loadedConfig,
    typescript.sys,
    baseDir,
  );

  if (parsedTsConfig.errors[0]) {
    printDiagnostics(parsedTsConfig.errors);
  }

  return parsedTsConfig;
}

function printDiagnostics(...args: any[]) {
  console.log(inspect(args, false, 10, true));
}

export function getTypescriptPlugin() {
  return tscPlugin();
}

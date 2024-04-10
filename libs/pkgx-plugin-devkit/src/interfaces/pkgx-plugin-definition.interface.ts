export interface CmdOption {
  flags: string;
  description?: string;
  defaultValue?: string | boolean | string[];
}

export interface PkgxGeneratorDefinition {
  factory: string;
  aliases?: string[];
  cmd?: {
    options?: CmdOption[];
  };
}

export interface PkgxExecutorDefinition {
  factory: string;
  aliases?: string[];
  cmd?: {
    passThrough?: boolean;
    arguments?: (
      | {
          flags: string;
          description?: string;
        }
      | string
    )[];
    options?: CmdOption[];
    includePkgxOptions?: boolean;
  };
}

export interface PkgxPluginDefinition {
  name: string;
  generators?: {
    [name: string]: PkgxGeneratorDefinition;
  };
  executors?: {
    [name: string]: PkgxExecutorDefinition;
  };
}

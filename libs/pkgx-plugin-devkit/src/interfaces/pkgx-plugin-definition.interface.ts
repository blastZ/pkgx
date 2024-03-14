export interface PkgxGeneratorDefinition {
  factory: string;
  aliases?: string[];
}

export interface PkgxExecutorDefinition {
  factory: string;
  aliases?: string[];
  cmd?: {
    passThrough?: boolean;
    arguments?: {
      flags: string;
      description?: string;
    }[];
    options?: {
      flags: string;
      description?: string;
      defaultValue?: string | boolean | string[];
    }[];
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

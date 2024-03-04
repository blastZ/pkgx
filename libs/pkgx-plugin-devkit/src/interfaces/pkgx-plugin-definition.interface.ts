export interface PkgxGeneratorDefinition {
  factory: string;
  aliases?: string[];
}

export interface PkgxExecutorDefinition {
  factory: string;
  aliases?: string[];
  cmd?: {
    arguments?: {
      flags: string;
      description?: string;
    }[];
    options?: {
      flags: string;
      description?: string;
      defaultValue?: string | boolean | string[];
    }[];
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

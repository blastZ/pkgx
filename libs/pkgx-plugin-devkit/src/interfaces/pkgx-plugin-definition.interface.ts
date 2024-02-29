export interface PkgxPluginDefinition {
  name: string;
  generators: {
    [name: string]: {
      factory: string;
      aliases?: string[];
    };
  };
}

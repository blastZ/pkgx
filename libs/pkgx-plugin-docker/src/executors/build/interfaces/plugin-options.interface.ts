export interface PluginOptions {
  hosts?: {
    [name: string]: {
      url: string;
      namespaces?: Record<string, string>;
    };
  };
}

export interface PkgxWorkspaceOptions {
  plugins?: {
    [pluginName: string]: Record<string, unknown> | undefined;
  };
}

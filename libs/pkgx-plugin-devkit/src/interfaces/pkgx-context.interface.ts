export interface PkgxContext<CmdOptions = Record<string, unknown>> {
  cmdArguments: string[];
  cmdOptions: CmdOptions;
}

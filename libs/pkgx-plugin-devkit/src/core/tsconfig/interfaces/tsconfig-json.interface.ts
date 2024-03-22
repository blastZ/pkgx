export interface TsconfigJson {
  extends?: string;
  compilerOptions?: {
    baseUrl?: string;
    paths?: Record<string, string[]>;
    emitDecoratorMetadata?: boolean;
  };
}

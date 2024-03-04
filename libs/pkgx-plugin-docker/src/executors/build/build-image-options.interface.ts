export interface BuildImageOptions {
  host?: string;
  namespace?: string;
  repo?: string;
  progress?: 'auto' | 'plain' | 'tty';
  cache?: boolean;
  target?: string;
  debug?: boolean;
  dryRun?: boolean;
}

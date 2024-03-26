import type { Stats } from 'node:fs';

import chokidar, { type FSWatcher, type WatchOptions } from 'chokidar';

export class Watcher {
  private watcher: FSWatcher;

  constructor(
    private paths: readonly string[],
    private options: WatchOptions = {},
  ) {
    this.watcher = chokidar.watch(this.paths, this.options);
  }

  onChange(listener: (path: string, stats?: Stats) => void) {
    this.watcher.on('change', listener);
  }

  async close() {
    await this.watcher.close();
  }
}

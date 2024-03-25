import { fork, type ChildProcess } from 'node:child_process';

import { PackageType } from '../enums/package-type.enum.js';
import type { PkgxOptions } from '../interfaces/pkgx-options.interface.js';

import { logger } from './logger.util.js';

export class NodeProcessManager {
  private child: ChildProcess | null = null;
  private timer: NodeJS.Timeout | null = null;

  private startFolder: string;

  constructor(private options: Required<PkgxOptions>) {
    this.startFolder =
      options.packageType === PackageType.Module ? 'esm' : 'cjs';
  }

  private startChild() {
    this.child = fork(
      `${this.options.outputDirName}/${this.startFolder}/index.js`,
      {
        execArgv: ['--enable-source-maps'],
        env: {
          ...process.env,
          APP_ENV: 'local',
          ...this.options.serveEnvs,
        },
      },
    );

    this.child.on('close', (code, signal) => {
      this.timer && clearTimeout(this.timer);

      if (code !== null && code !== 0) {
        logger.warn(
          `process exited with code ${code}, waiting for changes to restart...`,
        );
      } else {
        this.startChild();
      }
    });

    this.child.on('error', (err) => {
      logger.error(err.message);
    });
  }

  private isChildRunning() {
    return this.child && this.child.exitCode === null;
  }

  private stop() {
    if (!this.isChildRunning()) {
      return;
    }

    this.child!.kill('SIGTERM');

    this.timer = setTimeout(() => {
      if (this.isChildRunning()) {
        logger.error('process did not exit in time, forcing restart...');

        this.child!.kill('SIGKILL');
      }
    }, 5000);
  }

  reload() {
    if (this.isChildRunning()) {
      this.stop();
    } else {
      this.startChild();
    }
  }
}

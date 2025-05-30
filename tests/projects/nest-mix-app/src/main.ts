import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@/app.module.js';

export async function getServer() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });

  app.enableShutdownHooks();

  await app.init();

  return app.getHttpServer();
}

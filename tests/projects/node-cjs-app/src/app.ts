import Fastify from 'fastify';

import { log } from './utils/log';

export const app = Fastify({
  logger: true,
});

app.get('/', (request, reply) => {
  log('hahaha');

  reply.send({ success: true });
});

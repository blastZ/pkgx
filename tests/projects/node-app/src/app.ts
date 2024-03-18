import express from 'express';

import { log } from '@/utils/log.js';

export const app = express();

app.get('/', (req, res) => {
  log('hahaha');

  return res.json({
    success: true,
  });
});

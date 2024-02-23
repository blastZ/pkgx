import express from 'express';

export const app = express();

app.get('/', (req, res) => {
  return res.json({
    success: true,
  });
});

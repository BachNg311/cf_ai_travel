import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);

app.use((err, _req, res) => {
  const status = err.status || (err.name === 'ZodError' ? 400 : 500);
  res.status(status).json({
    error: err.message || 'Unexpected error',
    details: err.issues || undefined
  });
});

app.listen(env.port, () => {
  logger.info(`Travel agent server running on port ${env.port}`);
});


import express from 'express';
import { fileURLToPath } from 'node:url';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { createDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createTasksService } from './services/tasks-service.js';
import { createWinsService } from './services/wins-service.js';
import { createTasksRouter } from './routes/tasks.js';
import { createWinsRouter } from './routes/wins.js';

export function createApp({ db = createDatabase() } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '32kb', strict: true }));
  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/wins', createWinsRouter(createWinsService(db)));
  app.use('/api/tasks', createTasksRouter(createTasksService(db)));
  app.use('/api', notFoundHandler);
  app.use(express.static(fileURLToPath(new URL('../public/', import.meta.url)), {
    extensions: ['html'],
    index: 'index.html',
    dotfiles: 'deny',
    etag: true,
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0
  }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

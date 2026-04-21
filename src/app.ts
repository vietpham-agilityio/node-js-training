import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';

// Logger
import { pinoHttp } from 'pino-http';
import { createLogger } from '@/middlewares/logging.ts'

// Types
import type { Express, Request, Response, NextFunction } from 'express';

const createApp = (_dataSource: DataSource): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(pinoHttp({ logger: createLogger() }))

  // Not-found handler
  app.use((_req: Request, _res: Response, next: NextFunction): void => {
    next();
  });

  return app;
};

export default createApp;

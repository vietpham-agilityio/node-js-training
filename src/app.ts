import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import type { Express, Request, Response, NextFunction } from 'express';

// Logger
import { pinoHttp } from 'pino-http';
import { createLogger } from '@/middlewares/logging.ts'

// Middleware
import { globalErrorHandler } from '@/middlewares/error-handler.ts';

// Types
import { AppError } from '@/types/error.ts';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';

const createApp = (_dataSource: DataSource): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(pinoHttp({ logger: createLogger() }))

  // Not-found handler
  app.use((_req: Request, _res: Response, next: NextFunction): void => {
    next(new AppError(STATUS_CODE.NOT_FOUND));
  });

  app.use(globalErrorHandler)

  return app;
};

export default createApp;

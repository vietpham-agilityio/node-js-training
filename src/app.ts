import express from 'express';

// Types
import type { Express, Request, Response, NextFunction } from 'express';

const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(express.json());

  // Not-found handler
  app.use((_req: Request, _res: Response, next: NextFunction): void => {
    next();
  });

  return app;
};

export default createApp;

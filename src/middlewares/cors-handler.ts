import { NextFunction, Request, Response } from 'express';

import { CLIENT_URL } from '@/constants/environments.ts';

export const corsHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const origin = req.headers.origin;

  const isAllowedOrigin = Boolean(
    origin && CLIENT_URL && origin === CLIENT_URL,
  );

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};

import { describe, it, expect, vi } from 'vitest';
import express, { Application } from 'express';
import request from 'supertest';
import { AppError } from '@/types/error.ts';

vi.mock('@/constants/status-code.ts', () => ({
  STATUS_CODE: {
    INTERNAL_SERVER_ERROR: 500,
  },
  VALID_STATUS_CODES: new Set([400, 403, 404, 500]),
}));

vi.mock('@/constants/error-messages.ts', () => ({
  ERROR_MESSAGE_WITH_STATUS_CODE: {
    404: 'Resource not found',
    500: 'Internal Server Error',
  },
  ERROR_CODE_WITH_STATUS_CODE: {
    404: 'NOT_FOUND',
    500: 'INTERNAL_SERVER_ERROR',
  },
}));

import { globalErrorHandler } from '@/middlewares/error-handler.ts';

const createApp = (appError: AppError): Application => {
  const app = express();
  app.get('/lesson', (_req, _res, next) => {
    next(appError);
  });
  app.use(globalErrorHandler);
  return app;
};

describe('globalErrorHandler', () => {
  it('should return the error status and body when status is valid', async () => {
    const err = new AppError(404);

    const res = await request(createApp(err)).get('/lesson');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: 404,
      errorCode: 'NOT_FOUND',
      message: 'Resource not found',
    });
  });

  it('should return the error status and body when internal error', async () => {
    const err = new AppError(500);

    const res = await request(createApp(err)).get('/lesson');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
    });
  });
});

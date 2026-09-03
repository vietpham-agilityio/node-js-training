import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

import { LoggingInterceptor } from './logging.interceptor';

function contextFor(
  request: Record<string, unknown>,
  response: { statusCode: number; on: jest.Mock },
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}

function fakeResponse(): { statusCode: number; on: jest.Mock } {
  return { statusCode: 200, on: jest.fn() };
}

describe('LoggingInterceptor', () => {
  it('logs method, path, status, duration and user id once the response finishes', () => {
    const logger = { info: jest.fn() };
    const interceptor = new LoggingInterceptor(logger as never);
    const request = {
      method: 'GET',
      originalUrl: '/api/v1/movies',
      user: { id: 'user-1' },
    };
    const response = fakeResponse();
    response.statusCode = 200;
    const handler: CallHandler = { handle: () => of('result') };

    interceptor.intercept(contextFor(request, response), handler);

    const [event, onFinish] = response.on.mock.calls[0] as [string, () => void];
    expect(event).toBe('finish');

    onFinish();

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/api/v1/movies',
        statusCode: 200,
        userId: 'user-1',
      }),
      'request completed',
    );
  });

  it('logs a null user id when the request is unauthenticated', () => {
    const logger = { info: jest.fn() };
    const interceptor = new LoggingInterceptor(logger as never);
    const request = { method: 'GET', originalUrl: '/api/v1/movies' };
    const response = fakeResponse();
    const handler: CallHandler = { handle: () => of('result') };

    interceptor.intercept(contextFor(request, response), handler);
    const [, onFinish] = response.on.mock.calls[0] as [string, () => void];
    onFinish();

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null }),
      'request completed',
    );
  });
});

import { LoggingMiddleware } from './logging.middleware';
import { Request, Response, NextFunction } from 'express';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let consoleLogSpy: jest.SpyInstance;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    next = jest.fn();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next() exactly once', () => {
    const req = { method: 'GET', originalUrl: '/v1/users' } as Request;
    const res = {} as Response;

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should log the request method and originalUrl', () => {
    const req = { method: 'GET', originalUrl: '/v1/users' } as Request;
    const res = {} as Response;

    middleware.use(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /v1/users'),
    );
  });

  it('should log a timestamp in ISO 8601 format', () => {
    const req = { method: 'POST', originalUrl: '/v1/users' } as Request;
    const res = {} as Response;

    middleware.use(req, res, next);

    const loggedMessage = consoleLogSpy.mock.calls[0][0];
    const isoTimestampPattern = /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;
    expect(loggedMessage).toMatch(isoTimestampPattern);
  });

  it('should reflect different HTTP methods correctly', () => {
    const req = { method: 'DELETE', originalUrl: '/v1/users/9999' } as Request;
    const res = {} as Response;

    middleware.use(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('DELETE /v1/users/9999'),
    );
  });

  it('should not modify the request object', () => {
    const req = { method: 'GET', originalUrl: '/v1/users' } as Request;
    const res = {} as Response;
    const originalReq = { ...req };

    middleware.use(req, res, next);

    expect(req).toEqual(originalReq);
  });
});

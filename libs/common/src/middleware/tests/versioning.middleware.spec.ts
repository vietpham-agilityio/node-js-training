import { VersionManagementMiddleware } from '../versioning.middleware';
import { Request, Response, NextFunction } from 'express';

describe('VersionManagementMiddleware', () => {
  let middleware: VersionManagementMiddleware;
  let next: NextFunction;
  let res: Response;

  beforeEach(() => {
    middleware = new VersionManagementMiddleware();
    next = jest.fn();
    res = {} as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('requests with no version prefix', () => {
    it('should prepend v1 to an unversioned path', () => {
      const req = { originalUrl: '/users' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v1/users');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should prepend v1 to the root path', () => {
      const req = { originalUrl: '/' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v1');
    });

    it('should preserve query params when prepending v1', () => {
      const req = { originalUrl: '/users?page=2&limit=10' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v1/users?page=2&limit=10');
    });

    it('should prepend v1 for nested unversioned paths', () => {
      const req = { originalUrl: '/users/9999' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v1/users/9999');
    });
  });

  describe('requests with a valid version prefix', () => {
    it('should leave v1 paths unchanged', () => {
      const req = { originalUrl: '/v1/users' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v1/users');
    });

    it('should leave v2 paths unchanged', () => {
      const req = { originalUrl: '/v2/users' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v2/users');
    });

    it('should be case-insensitive when detecting an existing valid version', () => {
      const req = { originalUrl: '/V1/users' } as Request;

      middleware.use(req, res, next);

      // firstSegment is lowercased for the check, but the original
      // casing in the path segments array is untouched since only
      // segments[0] gets reassigned in the unsupported-version branch
      expect(req.url).toBe('/V1/users');
    });

    it('should preserve query params on valid versioned paths', () => {
      const req = { originalUrl: '/v2/users?sort=asc' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v2/users?sort=asc');
    });
  });

  describe('requests with an unsupported or invalid version', () => {
    it('should rewrite an unsupported numeric version to v2', () => {
      const req = { originalUrl: '/v555/users' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v2/users');
    });

    it('should rewrite an invalid alphanumeric version to v2', () => {
      const req = { originalUrl: '/v404x/users' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v2/users');
    });

    it('should rewrite v0 to v2', () => {
      const req = { originalUrl: '/v0/users' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v2/users');
    });

    it('should preserve query params when rewriting to v2', () => {
      const req = { originalUrl: '/v3/users?active=true' } as Request;

      middleware.use(req, res, next);

      expect(req.url).toBe('/v2/users?active=true');
    });
  });

  it('should always call next() exactly once', () => {
    const req = { originalUrl: '/v1/users' } as Request;

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

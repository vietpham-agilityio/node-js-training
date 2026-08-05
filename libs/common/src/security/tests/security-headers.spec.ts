import type { INestApplication } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { applySecurityHeaders } from '../security-headers';

type HelmetMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void;

/**
 * Runs whatever middleware `applySecurityHeaders` registered against a stub
 * request/response, and returns the headers it set.
 */
function collectHeaders(options: {
  httpsEnabled: boolean;
}): Record<string, string> {
  const headers: Record<string, string> = {};
  let middleware: HelmetMiddleware | undefined;

  const app = {
    use: (handler: HelmetMiddleware) => {
      middleware = handler;
    },
  } as unknown as INestApplication;

  applySecurityHeaders(app, options);
  expect(middleware).toBeDefined();

  const res = {
    setHeader: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
    },
    removeHeader: (name: string) => {
      delete headers[name.toLowerCase()];
    },
    getHeader: (name: string) => headers[name.toLowerCase()],
  } as unknown as ServerResponse;

  const next = jest.fn();
  middleware!({ secure: true } as unknown as IncomingMessage, res, next);
  expect(next).toHaveBeenCalledTimes(1);

  return headers;
}

describe('applySecurityHeaders', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should register a single middleware on the app', () => {
    const use = jest.fn();

    applySecurityHeaders({ use } as unknown as INestApplication, {
      httpsEnabled: false,
    });

    expect(use).toHaveBeenCalledTimes(1);
  });

  it("should set helmet's baseline headers", () => {
    const headers = collectHeaders({ httpsEnabled: false });

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['referrer-policy']).toBe('no-referrer');
    expect(headers['content-security-policy']).toBeDefined();
  });

  it('should keep the default CSP directives', () => {
    const headers = collectHeaders({ httpsEnabled: false });

    expect(headers['content-security-policy']).toContain("default-src 'self'");
  });

  // Swagger UI runs fine under a strict script-src because @nestjs/swagger 11
  // serves its bootstrap as an external swagger-ui-init.js. If a future upgrade
  // inlines it again this assertion is the reminder not to just add
  // 'unsafe-inline' — prefer a nonce.
  it("should not weaken script-src with 'unsafe-inline'", () => {
    const headers = collectHeaders({ httpsEnabled: false });

    expect(headers['content-security-policy']).toContain("script-src 'self'");
    expect(headers['content-security-policy']).not.toContain(
      "script-src 'self' 'unsafe-inline'",
    );
  });

  describe('HSTS', () => {
    it('should not emit HSTS when TLS is off', () => {
      process.env.NODE_ENV = 'production';

      const headers = collectHeaders({ httpsEnabled: false });

      expect(headers['strict-transport-security']).toBeUndefined();
    });

    // Emitting HSTS from https://localhost:<port> pins every localhost port,
    // since the policy is host-scoped and ignores the port.
    it('should not emit HSTS outside production even when TLS is on', () => {
      process.env.NODE_ENV = 'development';

      const headers = collectHeaders({ httpsEnabled: true });

      expect(headers['strict-transport-security']).toBeUndefined();
    });

    it('should emit HSTS when TLS is on in production', () => {
      process.env.NODE_ENV = 'production';

      const headers = collectHeaders({ httpsEnabled: true });

      expect(headers['strict-transport-security']).toBe(
        'max-age=31536000; includeSubDomains',
      );
    });
  });
});

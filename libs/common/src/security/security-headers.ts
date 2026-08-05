import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export interface SecurityHeaderOptions {
  httpsEnabled: boolean;
}

export function applySecurityHeaders(
  app: INestApplication,
  { httpsEnabled }: SecurityHeaderOptions,
): void {
  app.use(
    helmet({
      hsts:
        httpsEnabled && process.env.NODE_ENV === 'production'
          ? { maxAge: 31536000, includeSubDomains: true }
          : false,
    }),
  );
}

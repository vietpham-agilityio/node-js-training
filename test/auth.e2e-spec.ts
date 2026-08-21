import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

// Requires a reachable database — run `pnpm run db:up` first.
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  function uniqueEmail(): string {
    return `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  }

  it('registers, logs in, fetches /me, refreshes, then logs out', async () => {
    const email = uniqueEmail();
    const password = 'password123';

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password, firstName: 'E2E', lastName: 'Test' })
      .expect(201);

    expect(registerRes.body.accessToken).toBeDefined();
    expect(registerRes.body.refreshToken).toBeDefined();

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const { accessToken, refreshToken } = loginRes.body as {
      accessToken: string;
      refreshToken: string;
    };

    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(meRes.body.email).toBe(email);

    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);
    expect(refreshRes.body.refreshToken).not.toBe(refreshToken);

    // The rotated-out token is now revoked and must be rejected (BR-32).
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({ refreshToken: refreshRes.body.refreshToken as string })
      .expect(204);
  });

  it('rejects login with the wrong password', async () => {
    const email = uniqueEmail();
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'password123',
        firstName: 'E2E',
        lastName: 'Test',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);

    expect(res.body.errorCode).toBe('INVALID_CREDENTIALS');
  });

  it('rejects a duplicate registration email', async () => {
    const email = uniqueEmail();
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'password123',
        firstName: 'E2E',
        lastName: 'Test',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'password123',
        firstName: 'E2E',
        lastName: 'Test',
      })
      .expect(409);

    expect(res.body.errorCode).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('strips a client-supplied role instead of honouring it (BR-33)', async () => {
    const email = uniqueEmail();
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'password123',
        firstName: 'E2E',
        lastName: 'Test',
        role: 'admin',
      });

    // forbidNonWhitelisted rejects the extra field outright (existing
    // divergence from DDR-007, left as-is — see docs/decisions-vs-code.md).
    expect(res.status).toBe(400);
  });

  it('rejects /me without a token', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });
});

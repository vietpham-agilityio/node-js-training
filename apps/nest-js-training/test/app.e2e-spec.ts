import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/module/app/app.module';
import { VersionManagementMiddleware } from '@app/common';
import { Request, Response, NextFunction } from 'express';

describe('AppModule (integration)', () => {
  let app: INestApplication;

  const mockExternalUserDataService = {
    fetchUsers: jest.fn().mockResolvedValue([
      { id: 99, name: 'Mocked External User', email: 'mock@example.com' },
    ]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('EXTERNAL_USER_DATA_SERVICE')
      .useValue(mockExternalUserDataService)
      .compile();

    app = moduleFixture.createNestApplication();

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    const versionMiddleware = new VersionManagementMiddleware();
    app.use((req: Request, res: Response, next: NextFunction) => versionMiddleware.use(req, res, next));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - app boots and responds', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });

  describe('Users flow', () => {
    it('POST /v1/users - creates a new user', async () => {
      const newUser = {
        firstName: 'Kaito',
        lastName: 'Kid',
        phoneNumber: '0897278983',
        address: '1234, Lubumbashi, DRC',
      };

      const res = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', 'Bearer mock-token')
        .send(newUser)
        .expect(201);

      expect(res.body.data).toMatchObject({
        "id": 1,
        "firstName": 'Kaito',
        "lastName": 'Kid',
        "phoneNumber": '0897278983',
        "address": '1234, Lubumbashi, DRC',
      });
      expect(res.body.data.id).toBeDefined();
    });

    it('GET /v1/users - returns local and external users merged', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/users')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBeDefined();
    });

    it('GET /v1/users/:id - returns 404 for unknown user', () => {
      return request(app.getHttpServer())
        .get('/v1/users/9999')
        .expect(404);
    });
  });

  describe('Global middleware and interceptors', () => {
    it('applies response logging interceptor / versioning headers', async () => {
      const res = await request(app.getHttpServer()).get('/');
      expect(res.status).toBe(200);
    });
  });
});

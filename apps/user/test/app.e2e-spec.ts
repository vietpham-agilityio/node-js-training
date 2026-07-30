import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { UserModule } from '../src/user.module';
import { VersionManagementMiddleware, decodeBase64Key } from '@app/common';
import { USER_ROLE } from '@app/constants';
import { Request, Response, NextFunction } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
}

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let bearerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    const versionMiddleware = new VersionManagementMiddleware();
    app.use((req: Request, res: Response, next: NextFunction) =>
      versionMiddleware.use(req, res, next),
    );

    await app.init();

    const jwtService = new JwtService({
      privateKey: decodeBase64Key(process.env.JWT_PRIVATE_KEY_BASE64),
      signOptions: { algorithm: 'RS256' },
    });
    bearerToken = await jwtService.signAsync({
      sub: 1,
      email: 'kaito.kid@example.com',
      role: USER_ROLE.ADMIN,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - app boots and responds', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  describe('Users flow', () => {
    it('POST /v1/users - creates a new user', async () => {
      const newUser = {
        firstName: 'Kaito',
        lastName: 'Kid',
        email: 'kaito.kid@example.com',
        phoneNumber: '0897278983',
        address: '1234, Lubumbashi, DRC',
        password: 'Good_user@123',
      };

      const res = await request(app.getHttpServer())
        .post('/v1/users')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(newUser)
        .expect(201);

      const body = res.body as ApiResponse<UserResponse>;

      expect(body.data).toMatchObject({
        firstName: 'Kaito',
        lastName: 'Kid',
        phoneNumber: '0897278983',
        address: '1234, Lubumbashi, DRC',
      });
      expect(body.data.id).toBeDefined();
    });

    it('GET /v1/users - returns the created users', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/users')
        .expect(200);

      const body = res.body as ApiResponse<UserResponse[]>;

      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('GET /v1/users/:id - returns 404 for unknown user', () => {
      return request(app.getHttpServer()).get('/v1/users/9999999').expect(404);
    });
  });
});

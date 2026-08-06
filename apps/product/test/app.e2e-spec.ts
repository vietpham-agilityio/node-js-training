import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { ProductModule } from '../src/product.module';
import { VersionManagementMiddleware, decodeBase64Key } from '@app/common';
import { USER_ROLE } from '@app/constants';
import { Request, Response, NextFunction } from 'express';

interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
}

describe('ProductModule (e2e)', () => {
  let app: INestApplication;
  let bearerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductModule],
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
      email: 'product-tester@example.com',
      role: USER_ROLE.ADMIN,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Products flow', () => {
    it('POST /v1/products - creates a new product', async () => {
      const newProduct = {
        name: 'Sony Camera',
        description: 'Modern camera in future',
        price: 49000000,
        quantity: 10,
      };

      const res = await request(app.getHttpServer())
        .post('/v1/products')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(newProduct)
        .expect(201);

      const body = res.body as ProductResponse;

      expect(body).toMatchObject({
        name: 'Sony Camera',
        description: 'Modern camera in future',
        quantity: 10,
      });
      expect(body.id).toBeDefined();
    });

    it('GET /v1/products - returns the created products', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/products')
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(200);

      const body = res.body as ProductResponse[];

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it('GET /v1/products/:id - returns 404 for unknown product', () => {
      return request(app.getHttpServer())
        .get('/v1/products/9999999')
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(404);
    });

    it('POST /v1/products - rejects requests without a bearer token', () => {
      return request(app.getHttpServer())
        .post('/v1/products')
        .send({
          name: 'No Auth',
          description: 'Should be rejected',
          price: 1,
          quantity: 1,
        })
        .expect(401);
    });
  });
});

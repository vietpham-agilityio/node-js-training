import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { ProductModule } from '../src/product.module';
import { VersionManagementMiddleware } from '@app/common';
import { Request, Response, NextFunction } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
}

describe('ProductModule (e2e)', () => {
  let app: INestApplication;

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
        .set('Authorization', 'Bearer mock-token')
        .send(newProduct)
        .expect(201);

      const body = res.body as ApiResponse<ProductResponse>;

      expect(body.data).toMatchObject({
        name: 'Sony Camera',
        description: 'Modern camera in future',
        quantity: 10,
      });
      expect(body.data.id).toBeDefined();
    });

    it('GET /v1/products - returns the created products', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/products')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      const body = res.body as ApiResponse<ProductResponse[]>;

      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('GET /v1/products/:id - returns 404 for unknown product', () => {
      return request(app.getHttpServer())
        .get('/v1/products/9999999')
        .set('Authorization', 'Bearer mock-token')
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

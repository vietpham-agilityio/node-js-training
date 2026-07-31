import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { OrderModule } from './../src/order.module';
import { decodeBase64Key } from '@app/common';
import { USER_ROLE } from '@app/constants';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let bearerToken: string;

  beforeAll(async () => {
    const jwtService = new JwtService({
      privateKey: decodeBase64Key(process.env.JWT_PRIVATE_KEY_BASE64),
      signOptions: { algorithm: 'RS256' },
    });
    bearerToken = await jwtService.signAsync({
      sub: 1,
      email: 'order-tester@example.com',
      role: USER_ROLE.ADMIN,
    });
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrderModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /orders creates an order', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ name: 'Order Camera', productId: 12, quantity: 2 })
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'Order Camera',
      productId: 12,
      quantity: 2,
      status: 'Pending',
    });
    expect(res.body.id).toBeDefined();
  });

  it('POST /orders rejects requests without a bearer token', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({ name: 'No Auth', productId: 1, quantity: 1 })
      .expect(401);
  });

  it('GET /orders returns the created orders', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ name: 'Order Mouse', productId: 2, quantity: 1 })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${bearerToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /orders/:id returns 404 for an unknown order', () => {
    return request(app.getHttpServer())
      .get('/orders/999999')
      .set('Authorization', `Bearer ${bearerToken}`)
      .expect(404);
  });

  it('PATCH /orders/:id updates an order', async () => {
    const created = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ name: 'Order Keyboard', productId: 3, quantity: 1 });

    const res = await request(app.getHttpServer())
      .patch(`/orders/${created.body.id}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ quantity: 5 })
      .expect(200);

    expect(res.body.quantity).toBe(5);
  });

  it('DELETE /orders/:id removes an order', async () => {
    const created = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ name: 'Order Monitor', productId: 4, quantity: 1 });

    await request(app.getHttpServer())
      .delete(`/orders/${created.body.id}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/orders/${created.body.id}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .expect(404);
  });
});

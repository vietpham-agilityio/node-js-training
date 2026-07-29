import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { OrderModule } from './../src/order.module';

describe('OrderController (e2e)', () => {
  let app: INestApplication;

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

  it('GET /orders returns the created orders', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({ name: 'Order Mouse', productId: 2, quantity: 1 })
      .expect(201);

    const res = await request(app.getHttpServer()).get('/orders').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /orders/:id returns 404 for an unknown order', () => {
    return request(app.getHttpServer()).get('/orders/999999').expect(404);
  });

  it('PATCH /orders/:id updates an order', async () => {
    const created = await request(app.getHttpServer())
      .post('/orders')
      .send({ name: 'Order Keyboard', productId: 3, quantity: 1 });

    const res = await request(app.getHttpServer())
      .patch(`/orders/${created.body.id}`)
      .send({ quantity: 5 })
      .expect(200);

    expect(res.body.quantity).toBe(5);
  });

  it('DELETE /orders/:id removes an order', async () => {
    const created = await request(app.getHttpServer())
      .post('/orders')
      .send({ name: 'Order Monitor', productId: 4, quantity: 1 });

    await request(app.getHttpServer())
      .delete(`/orders/${created.body.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/orders/${created.body.id}`)
      .expect(404);
  });
});

import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from './../src/app.module';

interface ShowtimeSeatDto {
  seatId: string;
  status: 'available' | 'held' | 'reserved';
}

interface ShowtimeListItemDto {
  id: string;
  status: string;
  showDate: string;
  availableSeats: number;
}

// Requires a reachable database — run `pnpm run db:up` first. Exercises the
// DDR-002 confirmation transaction end to end: hold -> confirm -> cancel.
describe('Reservations (e2e)', () => {
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

  function uniqueEmail(name: string): string {
    return `e2e-${name}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  }

  async function registerAndLogin(name: string): Promise<string> {
    const email = uniqueEmail(name);
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password, firstName: 'E2E', lastName: name })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    return (loginRes.body as { accessToken: string }).accessToken;
  }

  // The seed (SeedService) always leaves a scheduled showtime with free
  // seats, so this needs no admin fixtures.
  async function holdASeat(
    token: string,
  ): Promise<{ showtimeId: string; seatId: string; holdId: string }> {
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/showtimes?limit=100')
      .expect(200);

    // Nothing flips showtime.status as real time passes (that gap is
    // documented in decisions-vs-code.md), so "scheduled" alone doesn't mean
    // "hasn't started yet" — require tomorrow or later so BR-29 cancellation
    // always has a genuinely upcoming showtime to work with.
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const showtime = (listRes.body.data as ShowtimeListItemDto[]).find(
      (s) =>
        s.status === 'scheduled' &&
        s.availableSeats > 0 &&
        s.showDate >= tomorrow,
    );
    if (!showtime) {
      throw new Error(
        'Seed produced no upcoming bookable showtime with free seats',
      );
    }

    const seatsRes = await request(app.getHttpServer())
      .get(`/api/v1/showtimes/${showtime.id}/seats`)
      .expect(200);
    const seat = (seatsRes.body as ShowtimeSeatDto[]).find(
      (s) => s.status === 'available',
    );
    if (!seat) {
      throw new Error('Showtime reported free seats but seat map has none');
    }

    const holdRes = await request(app.getHttpServer())
      .post(`/api/v1/showtimes/${showtime.id}/hold`)
      .set('Authorization', `Bearer ${token}`)
      .send({ seatIds: [seat.seatId] })
      .expect(201);

    return {
      showtimeId: showtime.id,
      seatId: seat.seatId,
      holdId: (holdRes.body.holds as { id: string }[])[0].id,
    };
  }

  it('confirms a held seat into a reservation, then rejects re-confirming the same hold', async () => {
    const token = await registerAndLogin('booker');
    const { showtimeId, seatId, holdId } = await holdASeat(token);

    const confirmRes = await request(app.getHttpServer())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ holdIds: [holdId] })
      .expect(201);

    expect(confirmRes.body).toMatchObject({
      status: 'confirmed',
      showtimeId,
      totalSeats: 1,
      tickets: [expect.objectContaining({ seatId, status: 'valid' })],
    });
    expect(confirmRes.body.reservationNumber).toMatch(
      /^RSV-\d{8}-[0-9A-Z]{6}$/,
    );

    const seatsAfterConfirm = await request(app.getHttpServer())
      .get(`/api/v1/showtimes/${showtimeId}/seats`)
      .expect(200);
    const seatStatus = (seatsAfterConfirm.body as ShowtimeSeatDto[]).find(
      (s) => s.seatId === seatId,
    )?.status;
    expect(seatStatus).toBe('reserved');

    const secondAttempt = await request(app.getHttpServer())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ holdIds: [holdId] });
    expect(secondAttempt.status).toBe(409);
    expect(secondAttempt.body.errorCode).toBe('SEAT_HOLD_EXPIRED');
  });

  it('cancels a reservation and frees the seat again', async () => {
    const token = await registerAndLogin('canceller');
    const { showtimeId, seatId, holdId } = await holdASeat(token);

    const confirmRes = await request(app.getHttpServer())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ holdIds: [holdId] })
      .expect(201);
    const reservationId = confirmRes.body.id as string;

    const cancelRes = await request(app.getHttpServer())
      .post(`/api/v1/reservations/${reservationId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(cancelRes.body.status).toBe('cancelled');
    expect(cancelRes.body.tickets[0].status).toBe('cancelled');

    const seatsAfterCancel = await request(app.getHttpServer())
      .get(`/api/v1/showtimes/${showtimeId}/seats`)
      .expect(200);
    const seatStatus = (seatsAfterCancel.body as ShowtimeSeatDto[]).find(
      (s) => s.seatId === seatId,
    )?.status;
    expect(seatStatus).toBe('available');
  });

  it('lets the owner read a reservation but not a different user', async () => {
    const ownerToken = await registerAndLogin('owner');
    const otherToken = await registerAndLogin('stranger');
    const { holdId } = await holdASeat(ownerToken);

    const confirmRes = await request(app.getHttpServer())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ holdIds: [holdId] })
      .expect(201);
    const reservationId = confirmRes.body.id as string;

    await request(app.getHttpServer())
      .get(`/api/v1/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const strangerRes = await request(app.getHttpServer())
      .get(`/api/v1/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(strangerRes.status).toBe(403);
    expect(strangerRes.body.errorCode).toBe('FORBIDDEN');
  });

  it('lists the confirmed reservation under GET /reservations/me', async () => {
    const token = await registerAndLogin('lister');
    const { holdId } = await holdASeat(token);

    const confirmRes = await request(app.getHttpServer())
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ holdIds: [holdId] })
      .expect(201);

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/reservations/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listRes.body.data).toContainEqual(
      expect.objectContaining({ id: confirmRes.body.id, status: 'confirmed' }),
    );
  });
});

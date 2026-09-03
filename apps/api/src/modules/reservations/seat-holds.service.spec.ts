import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ErrorCode } from '../../common/exceptions/error-codes';
import { Seat } from '../showtimes/entities/seat.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { ShowtimeStatus } from '../showtimes/enums/showtime-status.enum';
import { SeatHold } from './entities/seat-hold.entity';
import { SeatHoldStatus } from './enums/seat-hold-status.enum';
import { SeatHoldsService } from './seat-holds.service';

// heldUntil/status/id are DB-computed defaults, so the mock save() populates
// them the same way Postgres's RETURNING clause would for a real insert.
function mockManager() {
  return {
    create: jest.fn((_entityClass: unknown, data: unknown) => data),
    save: jest.fn((_entityClass: unknown, data: Record<string, unknown>[]) =>
      Promise.resolve(
        data.map((row, index) => ({
          id: `hold-${index}`,
          status: SeatHoldStatus.HELD,
          heldUntil: new Date('2026-01-01T00:10:00Z'),
          ...row,
        })),
      ),
    ),
  };
}

describe('SeatHoldsService', () => {
  let service: SeatHoldsService;
  let seatHoldsRepo: {
    manager: { transaction: jest.Mock } & ReturnType<typeof mockManager>;
  };
  let showtimesRepo: { findOne: jest.Mock };
  let seatsRepo: { find: jest.Mock };
  let manager: ReturnType<typeof mockManager>;

  const showtime = {
    id: 'st1',
    hallId: 'h1',
    status: ShowtimeStatus.SCHEDULED,
  } as Showtime;

  const seat = { id: 'seat-a1', hallId: 'h1', seatLabel: 'A1' } as Seat;

  beforeEach(async () => {
    manager = mockManager();
    seatHoldsRepo = {
      manager: {
        transaction: jest.fn((cb: (m: typeof manager) => unknown) =>
          cb(manager),
        ),
        ...manager,
      },
    };
    showtimesRepo = { findOne: jest.fn().mockResolvedValue(showtime) };
    seatsRepo = { find: jest.fn().mockResolvedValue([seat]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatHoldsService,
        { provide: getRepositoryToken(SeatHold), useValue: seatHoldsRepo },
        { provide: getRepositoryToken(Showtime), useValue: showtimesRepo },
        { provide: getRepositoryToken(Seat), useValue: seatsRepo },
      ],
    }).compile();

    service = module.get(SeatHoldsService);
  });

  it('holds the requested seats for the authenticated user, never a client-supplied one', async () => {
    const result = await service.holdSeats(
      'st1',
      { seatIds: ['seat-a1'] },
      'user-1',
    );

    expect(manager.create).toHaveBeenCalledWith(SeatHold, {
      showtimeId: 'st1',
      seatId: 'seat-a1',
      userId: 'user-1',
    });
    expect(result).toEqual({
      holds: [
        {
          id: 'hold-0',
          seatId: 'seat-a1',
          seatLabel: 'A1',
          showtimeId: 'st1',
          status: SeatHoldStatus.HELD,
          heldUntil: new Date('2026-01-01T00:10:00Z'),
        },
      ],
    });
  });

  it('throws NotFoundException for a missing showtime', async () => {
    showtimesRepo.findOne.mockResolvedValue(null);

    await expect(
      service.holdSeats('missing', { seatIds: ['seat-a1'] }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it.each([ShowtimeStatus.CANCELLED, ShowtimeStatus.COMPLETED])(
    'rejects a %s showtime with SHOWTIME_NOT_BOOKABLE',
    async (status) => {
      showtimesRepo.findOne.mockResolvedValue({ ...showtime, status });

      await expect(
        service.holdSeats('st1', { seatIds: ['seat-a1'] }, 'user-1'),
      ).rejects.toMatchObject({ errorCode: ErrorCode.SHOWTIME_NOT_BOOKABLE });
    },
  );

  it('throws BadRequestException when a seat does not belong to the hall', async () => {
    seatsRepo.find.mockResolvedValue([]);

    await expect(
      service.holdSeats('st1', { seatIds: ['seat-a1'] }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('translates a unique-violation race loss into SEAT_UNAVAILABLE', async () => {
    seatHoldsRepo.manager.transaction.mockRejectedValue({ code: '23505' });

    await expect(
      service.holdSeats('st1', { seatIds: ['seat-a1'] }, 'user-1'),
    ).rejects.toMatchObject({ errorCode: ErrorCode.SEAT_UNAVAILABLE });
  });

  it('rethrows an unrelated database error unchanged', async () => {
    const dbError = new Error('connection reset');
    seatHoldsRepo.manager.transaction.mockRejectedValue(dbError);

    await expect(
      service.holdSeats('st1', { seatIds: ['seat-a1'] }, 'user-1'),
    ).rejects.toThrow(dbError);
  });
});

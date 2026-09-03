import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ErrorCode } from '../../common/exceptions/error-codes';
import { Movie } from '../movies/entities/movie.entity';
import { SeatHoldStatus } from '../reservations/enums/seat-hold-status.enum';
import { Hall } from './entities/hall.entity';
import { Showtime } from './entities/showtime.entity';
import { HallType } from './enums/hall-type.enum';
import { ShowtimeStatus } from './enums/showtime-status.enum';
import { ShowtimesService } from './showtimes.service';

// Unlike MoviesService, one call path here builds two different queries — the
// page fetch and the seat-occupancy rows — so createQueryBuilder hands out a
// fresh builder each time and tests pick the one they care about by call order.
function mockQueryBuilder() {
  const qb: Record<string, jest.Mock> = {};
  for (const method of [
    'innerJoin',
    'leftJoin',
    'leftJoinAndSelect',
    'select',
    'addSelect',
    'where',
    'andWhere',
    'orderBy',
    'addOrderBy',
    'skip',
    'take',
  ]) {
    qb[method] = jest.fn().mockReturnValue(qb);
  }
  qb.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);
  qb.getMany = jest.fn().mockResolvedValue([]);
  qb.getRawMany = jest.fn().mockResolvedValue([]);
  return qb;
}

function mockManager() {
  return {
    query: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn(),
    create: jest.fn((_entityClass: unknown, data: unknown) => data),
    save: jest.fn((_entityClass: unknown, data: unknown) =>
      Promise.resolve({ id: 'st-new', ...(data as object) }),
    ),
    merge: jest.fn((_entityClass: unknown, target: object, data: object) => ({
      ...target,
      ...data,
    })),
  };
}

describe('ShowtimesService', () => {
  let service: ShowtimesService;
  let repo: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    manager: { transaction: jest.Mock } & ReturnType<typeof mockManager>;
  };
  let movies: { findOne: jest.Mock };
  let halls: { findOne: jest.Mock };
  let manager: ReturnType<typeof mockManager>;
  let builders: ReturnType<typeof mockQueryBuilder>[];
  // The overlap scan is the only query built off the transaction manager, so
  // it is tracked apart from the read builders the repository hands out.
  let overlapBuilders: ReturnType<typeof mockQueryBuilder>[];

  const hall: Hall = {
    id: 'h1',
    name: 'Hall 1',
    hallType: HallType.TWO_D,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    seats: [],
    showtimes: [],
  };

  const movie = {
    id: 'm1',
    title: 'Arrival',
    durationMinutes: 98,
    posterUrl: null,
    language: 'en',
    rating: null,
    isActive: true,
  } as Movie;

  const baseShowtime = {
    id: 'st1',
    movieId: 'm1',
    hallId: 'h1',
    showDate: '2026-09-01',
    showTime: '10:00:00',
    endTime: '11:38:00',
    basePrice: 9.5,
    status: ShowtimeStatus.SCHEDULED,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    movie,
    hall,
  } as Showtime;

  const seatRow = (label: string, overrides: object = {}) => ({
    showtimeId: 'st1',
    seatId: `seat-${label}`,
    seatRow: label[0],
    seatColumn: Number(label.slice(1)),
    seatLabel: label,
    holdStatus: null,
    heldByUserId: null,
    ...overrides,
  });

  /** The nth query builder handed out, in creation order. */
  const builder = (n: number) => builders[n];

  /** Stubs the overlap scan's result set and captures its query builder. */
  const withNeighbours = (neighbours: object[]) => {
    manager.createQueryBuilder.mockImplementation(() => {
      const qb = mockQueryBuilder();
      overlapBuilders.push(qb);
      qb.getMany.mockResolvedValue(neighbours);
      return qb;
    });
  };

  const overlapBuilder = () => overlapBuilders[overlapBuilders.length - 1];

  beforeEach(async () => {
    builders = [];
    overlapBuilders = [];
    manager = mockManager();
    const nextBuilder = () => {
      const qb = mockQueryBuilder();
      builders.push(qb);
      return qb;
    };
    withNeighbours([]);
    repo = {
      createQueryBuilder: jest.fn(nextBuilder),
      findOne: jest.fn().mockResolvedValue(baseShowtime),
      update: jest.fn(),
      manager: {
        transaction: jest.fn((cb: (m: typeof manager) => unknown) =>
          cb(manager),
        ),
        ...manager,
      },
    };
    movies = { findOne: jest.fn().mockResolvedValue(movie) };
    halls = { findOne: jest.fn().mockResolvedValue(hall) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        { provide: getRepositoryToken(Showtime), useValue: repo },
        { provide: getRepositoryToken(Hall), useValue: halls },
        { provide: getRepositoryToken(Movie), useValue: movies },
      ],
    }).compile();

    service = module.get(ShowtimesService);
  });

  describe('findAllShowtimes', () => {
    const query = { page: 1, limit: 20, skip: 0 } as never;

    it('hides cancelled showtimes from a non-admin caller', async () => {
      await service.findAllShowtimes(query, { includeCancelled: false });

      expect(builder(0).andWhere).toHaveBeenCalledWith(
        'showtime.status != :cancelled',
        { cancelled: ShowtimeStatus.CANCELLED },
      );
    });

    it('shows cancelled showtimes to an admin caller', async () => {
      await service.findAllShowtimes(query, { includeCancelled: true });

      expect(builder(0).andWhere).not.toHaveBeenCalledWith(
        'showtime.status != :cancelled',
        expect.anything(),
      );
    });

    it('merges the availability triple onto each row', async () => {
      builders = [];
      repo.createQueryBuilder.mockImplementation(() => {
        const qb = mockQueryBuilder();
        builders.push(qb);
        if (builders.length === 1) {
          qb.getManyAndCount.mockResolvedValue([[baseShowtime], 1]);
        } else {
          qb.getRawMany.mockResolvedValue([
            seatRow('A1'),
            seatRow('A2', { holdStatus: SeatHoldStatus.CONFIRMED }),
          ]);
        }
        return qb;
      });

      const { data, meta } = await service.findAllShowtimes(query, {
        includeCancelled: false,
      });

      expect(data[0]).toMatchObject({
        totalSeats: 2,
        seatsTaken: 1,
        availableSeats: 1,
      });
      expect(meta).toEqual({ page: 1, limit: 20, total: 1, hasMore: false });
    });

    it('reports zeroes rather than undefined for a showtime with no seats', async () => {
      builders = [];
      repo.createQueryBuilder.mockImplementation(() => {
        const qb = mockQueryBuilder();
        builders.push(qb);
        if (builders.length === 1) {
          qb.getManyAndCount.mockResolvedValue([[baseShowtime], 1]);
        }
        return qb;
      });

      const { data } = await service.findAllShowtimes(query, {
        includeCancelled: false,
      });

      expect(data[0]).toMatchObject({
        totalSeats: 0,
        seatsTaken: 0,
        availableSeats: 0,
      });
    });
  });

  describe('findSeatOccupancyRows', () => {
    // ADR-009's expiry sweep does not exist yet, so this predicate is the only
    // thing stopping an expired hold from reading as occupied. Assert on the
    // join text directly — it is the regression that would silently overbook.
    it('excludes expired holds in the join condition', async () => {
      await service.findShowtimeSeatMap('st1', { includeCancelled: false });

      const [, , condition, params] = builder(0).leftJoin.mock.calls[0];
      expect(condition).toContain('hold.heldUntil > NOW()');
      expect(params).toEqual({
        confirmed: SeatHoldStatus.CONFIRMED,
        held: SeatHoldStatus.HELD,
      });
    });

    it('treats both held and confirmed as occupying (ADR-008)', async () => {
      await service.findShowtimeSeatMap('st1', { includeCancelled: false });

      const [, , condition] = builder(0).leftJoin.mock.calls[0];
      expect(condition).toContain('hold.status = :confirmed');
      expect(condition).toContain('hold.status = :held');
    });

    it('counts only active seats', async () => {
      await service.findShowtimeSeatMap('st1', { includeCancelled: false });

      expect(builder(0).innerJoin).toHaveBeenCalledWith(
        'hall.seats',
        'seat',
        'seat.isActive = true',
      );
    });
  });

  describe('findShowtimeSeatMap', () => {
    const withRows = (rows: object[]) => {
      builders = [];
      repo.createQueryBuilder.mockImplementation(() => {
        const qb = mockQueryBuilder();
        builders.push(qb);
        qb.getRawMany.mockResolvedValue(rows);
        return qb;
      });
    };

    it('maps confirmed to reserved, live held to held, and nothing to available', async () => {
      withRows([
        seatRow('A1'),
        seatRow('A2', { holdStatus: SeatHoldStatus.HELD }),
        seatRow('A3', { holdStatus: SeatHoldStatus.CONFIRMED }),
      ]);

      const seats = await service.findShowtimeSeatMap('st1', {
        includeCancelled: false,
      });

      expect(seats.map(({ status }) => status)).toEqual([
        'available',
        'held',
        'reserved',
      ]);
    });

    it('flags only the caller’s own hold as isMine', async () => {
      withRows([
        seatRow('A1', {
          holdStatus: SeatHoldStatus.HELD,
          heldByUserId: 'user-1',
        }),
        seatRow('A2', {
          holdStatus: SeatHoldStatus.HELD,
          heldByUserId: 'user-2',
        }),
        seatRow('A3'),
      ]);

      const seats = await service.findShowtimeSeatMap(
        'st1',
        { includeCancelled: false },
        'user-1',
      );

      expect(seats.map(({ isMine }) => isMine)).toEqual([true, false, false]);
    });

    // The seat map is public, so ownership is meaningless without a caller.
    it('omits isMine entirely for an anonymous caller', async () => {
      withRows([seatRow('A1', { holdStatus: SeatHoldStatus.HELD })]);

      const [seat] = await service.findShowtimeSeatMap('st1', {
        includeCancelled: false,
      });

      expect(seat).not.toHaveProperty('isMine');
    });

    it('returns a plain array, not a pagination envelope', async () => {
      withRows([seatRow('A1')]);

      const seats = await service.findShowtimeSeatMap('st1', {
        includeCancelled: false,
      });

      expect(Array.isArray(seats)).toBe(true);
    });

    it('404s on a cancelled showtime for a non-admin caller', async () => {
      repo.findOne.mockResolvedValue({
        ...baseShowtime,
        status: ShowtimeStatus.CANCELLED,
      });

      await expect(
        service.findShowtimeSeatMap('st1', { includeCancelled: false }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createShowtime', () => {
    const dto = {
      movieId: 'm1',
      hallId: 'h1',
      showDate: '2026-09-01',
      showTime: '10:00',
      basePrice: 9.5,
    };

    it('normalizes HH:mm and computes endTime from the movie duration', async () => {
      withNeighbours([]);

      await service.createShowtime(dto);

      expect(manager.save).toHaveBeenCalledWith(
        Showtime,
        expect.objectContaining({
          showTime: '10:00:00',
          endTime: '11:38:00',
        }),
      );
    });

    it('takes the per-hall advisory lock before reading neighbours', async () => {
      withNeighbours([]);

      await service.createShowtime(dto);

      expect(manager.query).toHaveBeenCalledWith(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        ['h1'],
      );
    });

    it('rejects a partial intersection with SHOWTIME_OVERLAP', async () => {
      withNeighbours([
        { ...baseShowtime, showTime: '11:00:00', endTime: '12:38:00' },
      ]);

      await expect(service.createShowtime(dto as never)).rejects.toMatchObject({
        errorCode: ErrorCode.SHOWTIME_OVERLAP,
      });
    });

    // BR-28 specifies no turnaround buffer, so touching intervals are legal.
    it('allows a back-to-back showtime', async () => {
      withNeighbours([
        { ...baseShowtime, showTime: '11:38:00', endTime: '13:16:00' },
      ]);

      await expect(service.createShowtime(dto as never)).resolves.toBeDefined();
    });

    // endTime is stored wrapped, so a 23:00 start looks like it ends before it
    // begins. Comparing raw strings would miss this entirely.
    it('detects an overlap with a neighbour that wrapped past midnight', async () => {
      withNeighbours([
        {
          ...baseShowtime,
          showDate: '2026-08-31',
          showTime: '23:00:00',
          endTime: '01:30:00',
        },
      ]);

      await expect(
        service.createShowtime({ ...dto, showTime: '01:00' }),
      ).rejects.toMatchObject({ errorCode: ErrorCode.SHOWTIME_OVERLAP });
    });

    it('scans one day either side, not just the candidate date', async () => {
      withNeighbours([]);

      await service.createShowtime(dto);

      expect(overlapBuilder().andWhere).toHaveBeenCalledWith(
        'showtime.showDate BETWEEN :from AND :to',
        { from: '2026-08-31', to: '2026-09-02' },
      );
    });

    it('ignores cancelled neighbours', async () => {
      withNeighbours([]);

      await service.createShowtime(dto);

      expect(overlapBuilder().andWhere).toHaveBeenCalledWith(
        'showtime.status != :cancelled',
        { cancelled: ShowtimeStatus.CANCELLED },
      );
    });

    it('rejects an inactive movie before opening a transaction', async () => {
      movies.findOne.mockResolvedValue({ ...movie, isActive: false });

      await expect(service.createShowtime(dto as never)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it('rejects an inactive hall before opening a transaction', async () => {
      halls.findOne.mockResolvedValue({ ...hall, isActive: false });

      await expect(service.createShowtime(dto as never)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    // The ±1-day scan window is only sound while nothing spans a whole day.
    it('rejects a movie at least 24 hours long', async () => {
      movies.findOne.mockResolvedValue({ ...movie, durationMinutes: 1440 });

      await expect(service.createShowtime(dto as never)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('translates a unique violation into SHOWTIME_OVERLAP', async () => {
      withNeighbours([]);
      manager.save.mockRejectedValue({ code: '23505' });

      await expect(service.createShowtime(dto as never)).rejects.toMatchObject({
        errorCode: ErrorCode.SHOWTIME_OVERLAP,
      });
    });
  });

  describe('updateShowtime', () => {
    it('excludes the row being updated from the overlap scan', async () => {
      withNeighbours([]);

      await service.updateShowtime('st1', { showTime: '12:00' });

      expect(overlapBuilder().andWhere).toHaveBeenCalledWith(
        'showtime.id != :excludeId',
        { excludeId: 'st1' },
      );
    });

    it('recomputes endTime when showTime moves', async () => {
      withNeighbours([]);

      await service.updateShowtime('st1', { showTime: '12:00' });

      expect(manager.merge).toHaveBeenCalledWith(
        Showtime,
        expect.anything(),
        expect.objectContaining({ showTime: '12:00:00', endTime: '13:38:00' }),
      );
    });

    it('leaves endTime alone when only basePrice changes', async () => {
      withNeighbours([]);

      await service.updateShowtime('st1', { basePrice: 12 });

      expect(manager.merge).toHaveBeenCalledWith(
        Showtime,
        expect.anything(),
        expect.objectContaining({ endTime: '11:38:00' }),
      );
    });

    it('refuses completed -> scheduled', async () => {
      repo.findOne.mockResolvedValue({
        ...baseShowtime,
        status: ShowtimeStatus.COMPLETED,
      });

      await expect(
        service.updateShowtime('st1', {
          status: ShowtimeStatus.SCHEDULED,
        }),
      ).rejects.toMatchObject({
        errorCode: ErrorCode.SHOWTIME_INVALID_STATUS_TRANSITION,
      });
    });

    it('refuses to reschedule anything that is no longer scheduled', async () => {
      repo.findOne.mockResolvedValue({
        ...baseShowtime,
        status: ShowtimeStatus.COMPLETED,
      });

      await expect(
        service.updateShowtime('st1', { showTime: '09:00' }),
      ).rejects.toMatchObject({
        errorCode: ErrorCode.SHOWTIME_NOT_MODIFIABLE,
      });
    });

    // ADR-010 promises an accidental removal can be undone.
    it('allows cancelled -> scheduled and re-checks the slot', async () => {
      repo.findOne.mockResolvedValue({
        ...baseShowtime,
        status: ShowtimeStatus.CANCELLED,
      });
      withNeighbours([]);

      await service.updateShowtime('st1', {
        status: ShowtimeStatus.SCHEDULED,
      });

      expect(manager.query).toHaveBeenCalled();
      expect(overlapBuilder().getMany).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft-cancels by moving status, never deleting the row', async () => {
      await service.remove('st1');

      expect(repo.update).toHaveBeenCalledWith('st1', {
        status: ShowtimeStatus.CANCELLED,
      });
    });

    it('is a no-op on an already cancelled showtime', async () => {
      repo.findOne.mockResolvedValue({
        ...baseShowtime,
        status: ShowtimeStatus.CANCELLED,
      });

      await expect(service.remove('st1')).resolves.toBeUndefined();
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('refuses to cancel a completed showtime', async () => {
      repo.findOne.mockResolvedValue({
        ...baseShowtime,
        status: ShowtimeStatus.COMPLETED,
      });

      await expect(service.remove('st1')).rejects.toMatchObject({
        errorCode: ErrorCode.SHOWTIME_INVALID_STATUS_TRANSITION,
      });
    });
  });
});

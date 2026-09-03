import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SortOrder } from '../../common/enums/sort-order.enum';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Ticket } from '../reservations/entities/ticket.entity';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { ShowtimeStatus } from '../showtimes/enums/showtime-status.enum';
import { CapacityReportSortField } from './enums/capacity-report-sort-field.enum';
import { ReservationsReportSortField } from './enums/reservations-report-sort-field.enum';
import { RevenueReportSortField } from './enums/revenue-report-sort-field.enum';
import { ReportsService } from './reports.service';

// Every report method calls qb.getQueryAndParameters() once (for the count
// subquery) and qb.clone().orderBy()...getRawMany() once (for the page of
// rows). clone() hands back the same tracked builder — these tests only
// assert which SQL was requested, never mimic real sorting/filtering, so a
// self-referential clone keeps every call visible on one object.
function mockQueryBuilder(rawRows: unknown[] = []) {
  const qb: Record<string, jest.Mock> = {};
  for (const method of [
    'innerJoin',
    'leftJoin',
    'select',
    'addSelect',
    'where',
    'andWhere',
    'groupBy',
    'addGroupBy',
    'orderBy',
    'addOrderBy',
    'offset',
    'limit',
  ]) {
    qb[method] = jest.fn().mockReturnValue(qb);
  }
  qb.clone = jest.fn().mockReturnValue(qb);
  qb.getQueryAndParameters = jest.fn().mockReturnValue(['SELECT 1', []]);
  qb.getRawMany = jest.fn().mockResolvedValue(rawRows);
  return qb;
}

function mockRepository(rawRows: unknown[], total: number) {
  const qb = mockQueryBuilder(rawRows);
  return {
    createQueryBuilder: jest.fn(() => qb),
    manager: { query: jest.fn().mockResolvedValue([{ count: String(total) }]) },
    qb,
  };
}

describe('ReportsService', () => {
  let service: ReportsService;

  const buildService = async (repos: {
    tickets: ReturnType<typeof mockRepository>;
    reservations: ReturnType<typeof mockRepository>;
    showtimes: ReturnType<typeof mockRepository>;
  }): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Ticket), useValue: repos.tickets },
        {
          provide: getRepositoryToken(Reservation),
          useValue: repos.reservations,
        },
        { provide: getRepositoryToken(Showtime), useValue: repos.showtimes },
      ],
    }).compile();

    service = module.get(ReportsService);
  };

  describe('getRevenueReport', () => {
    it('applies from/to/movieId filters and converts raw string aggregates to numbers', async () => {
      const tickets = mockRepository(
        [
          {
            showDate: '2026-08-01',
            movieId: 'm1',
            movieTitle: 'Arrival',
            ticketsSold: '3',
            revenue: '31.50',
          },
        ],
        1,
      );

      await buildService({
        tickets,
        reservations: mockRepository([], 0),
        showtimes: mockRepository([], 0),
      });

      const result = await service.getRevenueReport({
        page: 1,
        limit: 20,
        skip: 0,
        from: '2026-08-01',
        to: '2026-08-31',
        movieId: 'm1',
        sortBy: RevenueReportSortField.SHOW_DATE,
        sortOrder: SortOrder.DESC,
      });

      expect(tickets.qb.andWhere).toHaveBeenCalledWith(
        'showtime.showDate >= :from',
        { from: '2026-08-01' },
      );
      expect(tickets.qb.andWhere).toHaveBeenCalledWith(
        'showtime.showDate <= :to',
        { to: '2026-08-31' },
      );
      expect(tickets.qb.andWhere).toHaveBeenCalledWith('movie.id = :movieId', {
        movieId: 'm1',
      });
      expect(tickets.qb.orderBy).toHaveBeenCalledWith('"showDate"', 'DESC');
      expect(result.data).toEqual([
        {
          showDate: '2026-08-01',
          movieId: 'm1',
          movieTitle: 'Arrival',
          ticketsSold: 3,
          revenue: 31.5,
        },
      ]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        hasMore: false,
      });
    });

    it('omits optional filters when not provided', async () => {
      const tickets = mockRepository([], 0);

      await buildService({
        tickets,
        reservations: mockRepository([], 0),
        showtimes: mockRepository([], 0),
      });

      await service.getRevenueReport({
        page: 1,
        limit: 20,
        skip: 0,
        sortBy: RevenueReportSortField.SHOW_DATE,
        sortOrder: SortOrder.DESC,
      });

      expect(tickets.qb.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('showDate'),
        expect.anything(),
      );
      expect(tickets.qb.andWhere).not.toHaveBeenCalledWith(
        'movie.id = :movieId',
        expect.anything(),
      );
    });

    it('maps a non-default sortBy to its SELECT alias', async () => {
      const tickets = mockRepository([], 0);

      await buildService({
        tickets,
        reservations: mockRepository([], 0),
        showtimes: mockRepository([], 0),
      });

      await service.getRevenueReport({
        page: 1,
        limit: 20,
        skip: 0,
        sortBy: RevenueReportSortField.TICKETS_SOLD,
        sortOrder: SortOrder.ASC,
      });

      expect(tickets.qb.orderBy).toHaveBeenCalledWith('"ticketsSold"', 'ASC');
      expect(tickets.qb.addOrderBy).toHaveBeenCalledWith('movie.id', 'ASC');
    });
  });

  describe('getCapacityReport', () => {
    it('applies hallId and status filters and defaults a null occupancyPct to zero', async () => {
      const showtimes = mockRepository(
        [
          {
            showtimeId: 'st1',
            movieTitle: 'Arrival',
            hallName: 'Hall 1',
            showDate: '2026-08-01',
            showTime: '19:00:00',
            status: ShowtimeStatus.SCHEDULED,
            totalSeats: '50',
            seatsTaken: '0',
            occupancyPct: null,
          },
        ],
        1,
      );

      await buildService({
        tickets: mockRepository([], 0),
        reservations: mockRepository([], 0),
        showtimes,
      });

      const result = await service.getCapacityReport({
        page: 1,
        limit: 20,
        skip: 0,
        hallId: 'h1',
        status: ShowtimeStatus.SCHEDULED,
        sortBy: CapacityReportSortField.SHOW_DATE,
        sortOrder: SortOrder.ASC,
      });

      expect(showtimes.qb.andWhere).toHaveBeenCalledWith('hall.id = :hallId', {
        hallId: 'h1',
      });
      expect(showtimes.qb.andWhere).toHaveBeenCalledWith(
        'showtime.status = :status',
        { status: ShowtimeStatus.SCHEDULED },
      );
      expect(showtimes.qb.orderBy).toHaveBeenCalledWith('"showDate"', 'ASC');
      expect(showtimes.qb.addOrderBy).toHaveBeenCalledWith(
        'showtime.id',
        'ASC',
      );
      expect(result.data[0]).toEqual({
        showtimeId: 'st1',
        movieTitle: 'Arrival',
        hallName: 'Hall 1',
        showDate: '2026-08-01',
        showTime: '19:00:00',
        status: ShowtimeStatus.SCHEDULED,
        totalSeats: 50,
        seatsTaken: 0,
        occupancyPct: 0,
      });
    });

    it('maps a non-default sortBy to its SELECT alias, descending', async () => {
      const showtimes = mockRepository([], 0);

      await buildService({
        tickets: mockRepository([], 0),
        reservations: mockRepository([], 0),
        showtimes,
      });

      await service.getCapacityReport({
        page: 1,
        limit: 20,
        skip: 0,
        sortBy: CapacityReportSortField.OCCUPANCY_PCT,
        sortOrder: SortOrder.DESC,
      });

      expect(showtimes.qb.orderBy).toHaveBeenCalledWith(
        '"occupancyPct"',
        'DESC',
      );
    });
  });

  describe('getReservationsReport', () => {
    it('applies the status filter and converts totals to numbers', async () => {
      const reservations = mockRepository(
        [
          {
            reservationId: 'r1',
            reservationNumber: 'RSV-20260801-000001',
            customerEmail: 'user@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
            movieTitle: 'Arrival',
            showDate: '2026-08-01',
            showTime: '19:00:00',
            status: ReservationStatus.CONFIRMED,
            totalSeats: '2',
            totalAmount: '21.00',
            createdAt: new Date('2026-07-01T00:00:00Z'),
          },
        ],
        1,
      );

      await buildService({
        tickets: mockRepository([], 0),
        reservations,
        showtimes: mockRepository([], 0),
      });

      const result = await service.getReservationsReport({
        page: 1,
        limit: 20,
        skip: 0,
        status: ReservationStatus.CONFIRMED,
        sortBy: ReservationsReportSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      });

      expect(reservations.qb.andWhere).toHaveBeenCalledWith(
        'reservation.status = :status',
        { status: ReservationStatus.CONFIRMED },
      );
      expect(reservations.qb.orderBy).toHaveBeenCalledWith(
        '"createdAt"',
        'DESC',
      );
      expect(reservations.qb.addOrderBy).toHaveBeenCalledWith(
        'reservation.id',
        'ASC',
      );
      expect(result.data[0]).toEqual({
        reservationId: 'r1',
        reservationNumber: 'RSV-20260801-000001',
        customerEmail: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        movieTitle: 'Arrival',
        showDate: '2026-08-01',
        showTime: '19:00:00',
        status: ReservationStatus.CONFIRMED,
        totalSeats: 2,
        totalAmount: 21,
        createdAt: new Date('2026-07-01T00:00:00Z'),
      });
    });

    it('maps a non-default sortBy to its SELECT alias', async () => {
      const reservations = mockRepository([], 0);

      await buildService({
        tickets: mockRepository([], 0),
        reservations,
        showtimes: mockRepository([], 0),
      });

      await service.getReservationsReport({
        page: 1,
        limit: 20,
        skip: 0,
        sortBy: ReservationsReportSortField.TOTAL_AMOUNT,
        sortOrder: SortOrder.ASC,
      });

      expect(reservations.qb.orderBy).toHaveBeenCalledWith(
        '"totalAmount"',
        'ASC',
      );
    });
  });
});

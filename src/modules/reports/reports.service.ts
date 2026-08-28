import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

import type { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Ticket } from '../reservations/entities/ticket.entity';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { SeatHoldStatus } from '../reservations/enums/seat-hold-status.enum';
import { TicketStatus } from '../reservations/enums/ticket-status.enum';
import { Showtime } from '../showtimes/entities/showtime.entity';
import type {
  CapacityReportQueryDto,
  RevenueReportQueryDto,
  ReservationsReportQueryDto,
} from './dto/report-query.dto';
import type {
  AdminReservationRowDto,
  CapacityReportRowDto,
  RevenueReportRowDto,
} from './dto/report-response.dto';
import {
  AdminReservationRawRow,
  CapacityReportRawRow,
  RevenueReportRawRow,
} from 'src/common/types';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
    @InjectRepository(Showtime)
    private readonly showtimes: Repository<Showtime>,
  ) {}

  async getRevenueReport({
    page,
    limit,
    skip,
    from,
    to,
    movieId,
  }: RevenueReportQueryDto): Promise<
    PaginatedResponseDto<RevenueReportRowDto>
  > {
    const qb = this.tickets
      .createQueryBuilder('ticket')
      .innerJoin('ticket.reservation', 'reservation')
      .innerJoin('reservation.showtime', 'showtime')
      .innerJoin('showtime.movie', 'movie')
      // DDR-010: a ticket counts as revenue once valid on a non-cancelled
      // reservation — the same status filter used by v_admin_revenue.
      .where('ticket.status = :valid', { valid: TicketStatus.VALID })
      .andWhere('reservation.status != :cancelled', {
        cancelled: ReservationStatus.CANCELLED,
      })
      .select('showtime.showDate', 'showDate')
      .addSelect('movie.id', 'movieId')
      .addSelect('movie.title', 'movieTitle')
      .addSelect('COUNT(ticket.id)', 'ticketsSold')
      .addSelect('SUM(ticket.price)', 'revenue')
      .groupBy('showtime.showDate')
      .addGroupBy('movie.id')
      .addGroupBy('movie.title');

    if (from) {
      qb.andWhere('showtime.showDate >= :from', { from });
    }
    if (to) {
      qb.andWhere('showtime.showDate <= :to', { to });
    }
    if (movieId) {
      qb.andWhere('movie.id = :movieId', { movieId });
    }

    const total = await this.countGroups(qb, this.tickets);
    const rows = await qb
      .clone()
      .orderBy('showtime.showDate', 'DESC')
      .addOrderBy('movie.title', 'ASC')
      .offset(skip)
      .limit(limit)
      .getRawMany<RevenueReportRawRow>();

    return {
      data: rows.map((row) => ({
        showDate: row.showDate,
        movieId: row.movieId,
        movieTitle: row.movieTitle,
        ticketsSold: Number(row.ticketsSold),
        revenue: Number(row.revenue),
      })),
      meta: { page, limit, total, hasMore: skip + rows.length < total },
    };
  }

  async getCapacityReport({
    page,
    limit,
    skip,
    from,
    to,
    hallId,
    status,
  }: CapacityReportQueryDto): Promise<
    PaginatedResponseDto<CapacityReportRowDto>
  > {
    // Same occupancy predicate as ShowtimesService.findSeatOccupancyRows
    // (ADR-008: a seat is occupied while its hold is confirmed, or held and
    // not yet expired), aggregated in SQL instead of summed in JS.
    const qb = this.showtimes
      .createQueryBuilder('showtime')
      .innerJoin('showtime.movie', 'movie')
      .innerJoin('showtime.hall', 'hall')
      .innerJoin('hall.seats', 'seat', 'seat.isActive = true')
      .leftJoin(
        'showtime.seatHolds',
        'hold',
        'hold.seatId = seat.id AND (hold.status = :confirmed OR (hold.status = :held AND hold.heldUntil > NOW()))',
        { confirmed: SeatHoldStatus.CONFIRMED, held: SeatHoldStatus.HELD },
      )
      .select('showtime.id', 'showtimeId')
      .addSelect('movie.title', 'movieTitle')
      .addSelect('hall.name', 'hallName')
      .addSelect('showtime.showDate', 'showDate')
      .addSelect('showtime.showTime', 'showTime')
      .addSelect('showtime.status', 'status')
      .addSelect('COUNT(DISTINCT seat.id)', 'totalSeats')
      .addSelect('COUNT(DISTINCT hold.id)', 'seatsTaken')
      .addSelect(
        'ROUND(COUNT(DISTINCT hold.id)::numeric / NULLIF(COUNT(DISTINCT seat.id), 0) * 100, 1)',
        'occupancyPct',
      )
      .groupBy('showtime.id')
      .addGroupBy('movie.title')
      .addGroupBy('hall.name')
      .addGroupBy('showtime.showDate')
      .addGroupBy('showtime.showTime')
      .addGroupBy('showtime.status');

    if (from) {
      qb.andWhere('showtime.showDate >= :from', { from });
    }
    if (to) {
      qb.andWhere('showtime.showDate <= :to', { to });
    }
    if (hallId) {
      qb.andWhere('hall.id = :hallId', { hallId });
    }
    if (status) {
      qb.andWhere('showtime.status = :status', { status });
    }

    const total = await this.countGroups(qb, this.showtimes);
    const rows = await qb
      .clone()
      .orderBy('showtime.showDate', 'ASC')
      .addOrderBy('showtime.showTime', 'ASC')
      .offset(skip)
      .limit(limit)
      .getRawMany<CapacityReportRawRow>();

    return {
      data: rows.map((row) => ({
        showtimeId: row.showtimeId,
        movieTitle: row.movieTitle,
        hallName: row.hallName,
        showDate: row.showDate,
        showTime: row.showTime,
        status: row.status,
        totalSeats: Number(row.totalSeats),
        seatsTaken: Number(row.seatsTaken),
        occupancyPct: row.occupancyPct === null ? 0 : Number(row.occupancyPct),
      })),
      meta: { page, limit, total, hasMore: skip + rows.length < total },
    };
  }

  async getReservationsReport({
    page,
    limit,
    skip,
    from,
    to,
    status,
  }: ReservationsReportQueryDto): Promise<
    PaginatedResponseDto<AdminReservationRowDto>
  > {
    const qb = this.reservations
      .createQueryBuilder('reservation')
      .innerJoin('reservation.user', 'user')
      .innerJoin('reservation.showtime', 'showtime')
      .innerJoin('showtime.movie', 'movie')
      .leftJoin('reservation.tickets', 'ticket')
      .select('reservation.id', 'reservationId')
      .addSelect('reservation.reservationNumber', 'reservationNumber')
      .addSelect('user.email', 'customerEmail')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('movie.title', 'movieTitle')
      .addSelect('showtime.showDate', 'showDate')
      .addSelect('showtime.showTime', 'showTime')
      .addSelect('reservation.status', 'status')
      .addSelect('COUNT(ticket.id)', 'totalSeats')
      // TicketStatus.VALID is a fixed enum constant, not caller input, so
      // inlining it into the FILTER clause is safe — same as
      // v_reservation_summary's total_amount column.
      .addSelect(
        `COALESCE(SUM(ticket.price) FILTER (WHERE ticket.status = '${TicketStatus.VALID}'), 0)`,
        'totalAmount',
      )
      .addSelect('reservation.createdAt', 'createdAt')
      .groupBy('reservation.id')
      .addGroupBy('user.email')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .addGroupBy('movie.title')
      .addGroupBy('showtime.showDate')
      .addGroupBy('showtime.showTime');

    if (from) {
      qb.andWhere('showtime.showDate >= :from', { from });
    }
    if (to) {
      qb.andWhere('showtime.showDate <= :to', { to });
    }
    if (status) {
      qb.andWhere('reservation.status = :status', { status });
    }

    const total = await this.countGroups(qb, this.reservations);
    const rows = await qb
      .clone()
      .orderBy('reservation.createdAt', 'DESC')
      .offset(skip)
      .limit(limit)
      .getRawMany<AdminReservationRawRow>();

    return {
      data: rows.map((row) => ({
        reservationId: row.reservationId,
        reservationNumber: row.reservationNumber,
        customerEmail: row.customerEmail,
        firstName: row.firstName,
        lastName: row.lastName,
        movieTitle: row.movieTitle,
        showDate: row.showDate,
        showTime: row.showTime,
        status: row.status,
        totalSeats: Number(row.totalSeats),
        totalAmount: Number(row.totalAmount),
        createdAt: row.createdAt,
      })),
      meta: { page, limit, total, hasMore: skip + rows.length < total },
    };
  }

  // Wraps a grouped query builder in COUNT(*) to get the number of groups —
  // getManyAndCount() doesn't apply to raw aggregate results, so the same
  // filtered/joined/grouped query is reused as a subquery rather than
  // duplicating the WHERE/JOIN logic in a second hand-written count query.
  private async countGroups<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    repository: Repository<T>,
  ): Promise<number> {
    const [sql, parameters] = qb.getQueryAndParameters();
    const result = await repository.manager.query<{ count: string }[]>(
      `SELECT COUNT(*)::int AS count FROM (${sql}) AS grouped`,
      parameters,
    );
    return Number(result[0].count);
  }
}

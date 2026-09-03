import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager, Repository } from 'typeorm';

import { BaseAbstractService } from '../../common/base/base-crud.service';
import type { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-codes';
import {
  addDaysToDateString,
  addMinutesToTimeString,
  daysBetweenDateStrings,
  durationBetweenTimeStrings,
  minutesOfTimeString,
  normalizeTimeString,
} from '../../common/utils/time.util';
import {
  ALLOWED_TRANSITIONS,
  EMPTY_AVAILABILITY,
  MINUTES_PER_DAY,
  UNIQUE_VIOLATION,
} from '../../common/constant';
import type { Availability } from '../../common/types';
import { Movie } from '../movies/entities/movie.entity';
import { SeatHoldStatus } from '../reservations/enums/seat-hold-status.enum';
import type {
  CreateShowtimeDto,
  ShowtimeListQueryDto,
  ShowtimeResponseDto,
  ShowtimeSeatResponseDto,
  UpdateShowtimeDto,
} from './dto/showtime.dto';
import { Hall } from './entities/hall.entity';
import { Showtime } from './entities/showtime.entity';
import { SeatStatus } from './enums/seat-status.enum';
import { ShowtimeStatus } from './enums/showtime-status.enum';

interface VisibilityOptions {
  includeCancelled: boolean;
}

// One seat (showtime, active seat), with the occupying hold if there is one.
interface SeatOccupancyRow {
  showtimeId: string;
  seatId: string;
  seatRow: string;
  seatColumn: number;
  seatLabel: string;
  holdStatus: SeatHoldStatus | null;
  heldByUserId: string | null;
}

@Injectable()
export class ShowtimesService extends BaseAbstractService<Showtime> {
  constructor(
    @InjectRepository(Showtime) repository: Repository<Showtime>,
    @InjectRepository(Hall) private readonly halls: Repository<Hall>,
    @InjectRepository(Movie) private readonly movies: Repository<Movie>,
  ) {
    super(repository, 'Showtime');
  }

  async findAllShowtimes(
    { page, limit, skip, date, movieId, hallId }: ShowtimeListQueryDto,
    { includeCancelled }: VisibilityOptions,
  ): Promise<PaginatedResponseDto<ShowtimeResponseDto>> {
    const qb = this.repository
      .createQueryBuilder('showtime')
      .leftJoinAndSelect('showtime.movie', 'movie')
      .leftJoinAndSelect('showtime.hall', 'hall')
      .orderBy('showtime.showDate', 'ASC')
      .addOrderBy('showtime.showTime', 'ASC')
      .skip(skip)
      .take(limit);

    // ADR-010: a cancelled showtime is a soft-deleted one, so it leaves the
    // public listing but stays visible to an admin token.
    if (!includeCancelled) {
      qb.andWhere('showtime.status != :cancelled', {
        cancelled: ShowtimeStatus.CANCELLED,
      });
    }
    if (date) {
      qb.andWhere('showtime.showDate = :date', { date });
    }
    if (movieId) {
      qb.andWhere('showtime.movieId = :movieId', { movieId });
    }
    if (hallId) {
      qb.andWhere('showtime.hallId = :hallId', { hallId });
    }

    const [showtimes, total] = await qb.getManyAndCount();

    const availability = await this.findAvailability(
      showtimes.map(({ id }) => id),
    );

    return {
      data: showtimes.map((showtime) =>
        this.toResponse(
          showtime,
          availability.get(showtime.id) ?? EMPTY_AVAILABILITY,
        ),
      ),
      meta: { page, limit, total, hasMore: skip + showtimes.length < total },
    };
  }

  async findOneShowtime(
    id: string,
    options: VisibilityOptions,
  ): Promise<ShowtimeResponseDto> {
    const showtime = await this.findVisible(id, options);
    const availability = await this.findAvailability([id]);

    return this.toResponse(
      showtime,
      availability.get(id) ?? EMPTY_AVAILABILITY,
    );
  }

  // DDR-003: the seat map and the availability counts are two readings of the
  // same rows, so they share findSeatOccupancyRows rather than counting twice.
  async findShowtimeSeatMap(
    id: string,
    options: VisibilityOptions,
    callerId?: string,
  ): Promise<ShowtimeSeatResponseDto[]> {
    await this.findVisible(id, options);
    const rows = await this.findSeatOccupancyRows([id]);

    return rows.map((row) => this.toSeatResponse(row, callerId));
  }

  async createShowtime(dto: CreateShowtimeDto): Promise<ShowtimeResponseDto> {
    const showTime = normalizeTimeString(dto.showTime);
    const { durationMinutes } = await this.assertMovieAndHallBookable(
      dto.movieId,
      dto.hallId,
    );

    const showtime = await this.withOverlapMapping(() =>
      this.repository.manager.transaction(async (manager) => {
        await this.lockHall(manager, dto.hallId);
        await this.assertNoOverlap(manager, {
          hallId: dto.hallId,
          showDate: dto.showDate,
          showTime,
          durationMinutes,
        });

        return manager.save(
          Showtime,
          manager.create(Showtime, {
            ...dto,
            showTime,
            endTime: addMinutesToTimeString(showTime, durationMinutes),
          }),
        );
      }),
    );

    return this.findOneShowtime(showtime.id, { includeCancelled: true });
  }

  async updateShowtime(
    id: string,
    dto: UpdateShowtimeDto,
  ): Promise<ShowtimeResponseDto> {
    const showtime = await this.findVisible(id, { includeCancelled: true });
    const status = dto.status ?? showtime.status;

    // Order matters: the transition is judged against what the showtime is
    // now, mutability against what it is about to become. That lets one PATCH
    // un-cancel and reschedule at once, which is the natural recovery path.
    this.assertStatusTransition(showtime.status, status);
    this.assertModifiable(status, dto);

    const showTime =
      dto.showTime === undefined
        ? showtime.showTime
        : normalizeTimeString(dto.showTime);
    const showDate = dto.showDate ?? showtime.showDate;
    const reschedules =
      showDate !== showtime.showDate || showTime !== showtime.showTime;

    await this.withOverlapMapping(() =>
      this.repository.manager.transaction(async (manager) => {
        // A revived showtime re-enters the schedule, so its slot must be
        // re-checked even when neither the date nor the time moved.
        if (reschedules || status !== showtime.status) {
          await this.lockHall(manager, showtime.hallId);
          await this.assertNoOverlap(manager, {
            hallId: showtime.hallId,
            showDate,
            showTime,
            durationMinutes: durationBetweenTimeStrings(
              showtime.showTime,
              showtime.endTime,
            ),
            excludeId: id,
          });
        }

        await manager.save(
          Showtime,
          manager.merge(Showtime, showtime, {
            ...dto,
            showDate,
            showTime,
            status,
            // BR-28: end_time is derived, so any move of show_time carries it.
            endTime: addMinutesToTimeString(
              showTime,
              durationBetweenTimeStrings(showtime.showTime, showtime.endTime),
            ),
          }),
        );
      }),
    );

    return this.findOneShowtime(id, { includeCancelled: true });
  }

  // Implements BaseAbstractService's abstract remove() — ADR-010: a showtime
  // is soft-deleted by moving to cancelled, never by removing the row, since
  // reservations reference it ON DELETE RESTRICT.
  async remove(id: string): Promise<void> {
    const showtime = await this.findVisible(id, { includeCancelled: true });

    if (showtime.status === ShowtimeStatus.CANCELLED) {
      return;
    }

    this.assertStatusTransition(showtime.status, ShowtimeStatus.CANCELLED);
    await this.repository.update(showtime.id, {
      status: ShowtimeStatus.CANCELLED,
    });
  }

  private async findVisible(
    id: string,
    { includeCancelled }: VisibilityOptions,
  ): Promise<Showtime> {
    const showtime = await this.repository.findOne({
      where: { id },
      relations: { movie: true, hall: true },
    });

    if (
      !showtime ||
      (showtime.status === ShowtimeStatus.CANCELLED && !includeCancelled)
    ) {
      throw new NotFoundException(`Showtime with id ${id} not found`);
    }

    return showtime;
  }

  private async assertMovieAndHallBookable(
    movieId: string,
    hallId: string,
  ): Promise<Movie> {
    const [movie, hall] = await Promise.all([
      this.movies.findOne({ where: { id: movieId } }),
      this.halls.findOne({ where: { id: hallId } }),
    ]);

    // ADR-010: an inactive movie or hall has been retired from the catalogue,
    // so scheduling into it would publish a showtime nobody can browse to.
    if (!movie || !movie.isActive) {
      throw new BadRequestException(`Movie ${movieId} is not bookable`);
    }
    if (!hall || !hall.isActive) {
      throw new BadRequestException(`Hall ${hallId} is not bookable`);
    }
    // The overlap window below only reaches one day either side, which holds
    // as long as no showtime can span a whole day.
    if (movie.durationMinutes >= MINUTES_PER_DAY) {
      throw new BadRequestException(
        'Movie duration must be under 24 hours to be scheduled',
      );
    }

    return movie;
  }

  /**
   * Last line of defence for BR-28. assertNoOverlap runs under an advisory
   * lock, but uq_showtimes_hall_date_time is the constraint that actually
   * cannot be raced — so if it fires, translate it rather than leaking a
   * driver error. An exact duplicate slot is the degenerate overlap, which is
   * why it reuses SHOWTIME_OVERLAP.
   */
  private async withOverlapMapping<T>(write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new AppException(
          ErrorCode.SHOWTIME_OVERLAP,
          'A showtime already occupies that slot in the same hall',
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  // BR-28 is a read-then-write check, so two concurrent admin writes could
  // both see a free slot — and row locks cannot help, because the conflicting
  // row does not exist yet. Serialising on the hall is enough: showtime writes
  // are rare admin operations, and holding the lock to commit costs nothing.
  private async lockHall(
    manager: EntityManager,
    hallId: string,
  ): Promise<void> {
    await manager.query(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [hallId],
    );
  }

  /**
   * BR-28: [show_time, end_time) may not overlap another non-cancelled
   * showtime in the same hall.
   *
   * uq_showtimes_hall_date_time only catches an identical start, so the real
   * check happens here. Times are compared as minute offsets anchored on the
   * candidate's date rather than as strings, because end_time is stored
   * wrapped: a 23:00 start with a 150-minute movie persists '01:30:00' on the
   * same show_date while genuinely occupying the next day. That is also why
   * the scan reaches one day either side.
   */
  private async assertNoOverlap(
    manager: EntityManager,
    {
      hallId,
      showDate,
      showTime,
      durationMinutes,
      excludeId,
    }: {
      hallId: string;
      showDate: string;
      showTime: string;
      durationMinutes: number;
      excludeId?: string;
    },
  ): Promise<void> {
    const qb = manager
      .createQueryBuilder(Showtime, 'showtime')
      .where('showtime.hallId = :hallId', { hallId })
      .andWhere('showtime.showDate BETWEEN :from AND :to', {
        from: addDaysToDateString(showDate, -1),
        to: addDaysToDateString(showDate, 1),
      })
      // "Another active showtime" reads as "not cancelled": a scheduled slot
      // must block just as firmly as a running one, and a completed one must
      // not be backfilled.
      .andWhere('showtime.status != :cancelled', {
        cancelled: ShowtimeStatus.CANCELLED,
      });

    if (excludeId) {
      qb.andWhere('showtime.id != :excludeId', { excludeId });
    }

    const neighbours = await qb.getMany();

    const candidateStart = minutesOfTimeString(showTime);
    const candidateEnd = candidateStart + durationMinutes;

    const clash = neighbours.find((neighbour) => {
      const existingStart =
        daysBetweenDateStrings(showDate, neighbour.showDate) * MINUTES_PER_DAY +
        minutesOfTimeString(neighbour.showTime);
      const existingEnd =
        existingStart +
        durationBetweenTimeStrings(neighbour.showTime, neighbour.endTime);

      // Half-open, so back-to-back showtimes are allowed: BR-28 specifies no
      // turnaround buffer.
      return candidateStart < existingEnd && existingStart < candidateEnd;
    });

    if (clash) {
      throw new AppException(
        ErrorCode.SHOWTIME_OVERLAP,
        `Showtime overlaps ${clash.showDate} ${clash.showTime} in the same hall`,
        HttpStatus.CONFLICT,
      );
    }
  }

  private assertStatusTransition(
    current: ShowtimeStatus,
    next: ShowtimeStatus,
  ): void {
    if (current === next || ALLOWED_TRANSITIONS[current].includes(next)) {
      return;
    }

    throw new AppException(
      ErrorCode.SHOWTIME_INVALID_STATUS_TRANSITION,
      `A ${current} showtime cannot become ${next}`,
      HttpStatus.CONFLICT,
    );
  }

  // Rescheduling a showtime people may already hold seats against would move
  // the event under them, so the slot and price are settled only while it is
  // still merely scheduled.
  private assertModifiable(
    status: ShowtimeStatus,
    { showDate, showTime, basePrice }: UpdateShowtimeDto,
  ): void {
    const reschedules =
      showDate !== undefined ||
      showTime !== undefined ||
      basePrice !== undefined;

    if (reschedules && status !== ShowtimeStatus.SCHEDULED) {
      throw new AppException(
        ErrorCode.SHOWTIME_NOT_MODIFIABLE,
        `A ${status} showtime cannot be rescheduled or repriced`,
        HttpStatus.CONFLICT,
      );
    }
  }

  /**
   * One row per active seat in the showtime's hall, carrying the hold that
   * occupies it or nulls if it is free.
   *
   * The occupancy predicate lives in the JOIN condition, not a CASE, for two
   * reasons. It is the exact condition uq_seat_hold_active is written against
   * — ADR-008: a seat is occupied while its hold is HELD or CONFIRMED — so at
   * most one hold row can ever join per (showtime, seat) and COUNT cannot be
   * inflated. And ADR-009's 60-second expiry sweep does not exist yet, so
   * expired holds sit in the table unswept; requiring held_until > NOW() here
   * makes them fail to join and correctly read as available.
   */
  private findSeatOccupancyRows(
    showtimeIds: string[],
  ): Promise<SeatOccupancyRow[]> {
    if (showtimeIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.repository
      .createQueryBuilder('showtime')
      .innerJoin('showtime.hall', 'hall')
      .innerJoin('hall.seats', 'seat', 'seat.isActive = true')
      .leftJoin(
        'showtime.seatHolds',
        'hold',
        'hold.seatId = seat.id AND (hold.status = :confirmed OR (hold.status = :held AND hold.heldUntil > NOW()))',
        { confirmed: SeatHoldStatus.CONFIRMED, held: SeatHoldStatus.HELD },
      )
      .select('showtime.id', 'showtimeId')
      .addSelect('seat.id', 'seatId')
      .addSelect('seat.seatRow', 'seatRow')
      .addSelect('seat.seatColumn', 'seatColumn')
      .addSelect('seat.seatLabel', 'seatLabel')
      .addSelect('hold.status', 'holdStatus')
      .addSelect('hold.userId', 'heldByUserId')
      .where('showtime.id IN (:...showtimeIds)', { showtimeIds })
      .orderBy('seat.seatRow', 'ASC')
      .addOrderBy('seat.seatColumn', 'ASC')
      .getRawMany<SeatOccupancyRow>();
  }

  private async findAvailability(
    showtimeIds: string[],
  ): Promise<Map<string, Availability>> {
    const rows = await this.findSeatOccupancyRows(showtimeIds);

    return rows.reduce((availability, { showtimeId, holdStatus }) => {
      const current = availability.get(showtimeId) ?? { ...EMPTY_AVAILABILITY };

      current.totalSeats += 1;

      if (holdStatus !== null) {
        current.seatsTaken += 1;
      }

      current.availableSeats = current.totalSeats - current.seatsTaken;

      return availability.set(showtimeId, current);
    }, new Map<string, Availability>());
  }

  private toSeatResponse(
    {
      seatId,
      seatRow,
      seatColumn,
      seatLabel,
      holdStatus,
      heldByUserId,
    }: SeatOccupancyRow,
    callerId?: string,
  ): ShowtimeSeatResponseDto {
    const seat: ShowtimeSeatResponseDto = {
      seatId,
      seatRow,
      seatColumn: Number(seatColumn),
      seatLabel,
      status:
        holdStatus === SeatHoldStatus.CONFIRMED
          ? SeatStatus.RESERVED
          : holdStatus === SeatHoldStatus.HELD
            ? SeatStatus.HELD
            : SeatStatus.AVAILABLE,
    };

    // The seat map is public, so ownership only means something once a caller
    // has identified themselves — an anonymous browser gets no isMine at all.
    if (callerId !== undefined) {
      seat.isMine = heldByUserId === callerId;
    }

    return seat;
  }

  private toResponse(
    { movie, hall, ...showtime }: Showtime,
    availability: Availability,
  ): ShowtimeResponseDto {
    return {
      ...showtime,
      movie: movie
        ? {
            id: movie.id,
            title: movie.title,
            durationMinutes: movie.durationMinutes,
            posterUrl: movie.posterUrl,
            language: movie.language,
            rating: movie.rating,
          }
        : null,
      hall: hall
        ? { id: hall.id, name: hall.name, hallType: hall.hallType }
        : null,
      ...availability,
    };
  }
}

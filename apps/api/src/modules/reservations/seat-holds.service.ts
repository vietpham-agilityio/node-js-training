import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { NOT_BOOKABLE_STATUSES, UNIQUE_VIOLATION } from '../../common/constant';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-codes';
import { Seat } from '../showtimes/entities/seat.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { ShowtimeStatus } from '../showtimes/enums/showtime-status.enum';
import type {
  CreateSeatHoldDto,
  HoldSeatsResponseDto,
} from './dto/seat-hold.dto';
import { SeatHold } from './entities/seat-hold.entity';

@Injectable()
export class SeatHoldsService {
  constructor(
    @InjectRepository(SeatHold)
    private readonly seatHolds: Repository<SeatHold>,
    @InjectRepository(Showtime)
    private readonly showtimes: Repository<Showtime>,
    @InjectRepository(Seat)
    private readonly seats: Repository<Seat>,
  ) {}

  // ADR-007: the partial unique index uq_seat_hold_active is the actual
  // overbooking guarantee — this method just gets a well-formed INSERT to it
  // and translates the 23505 a losing concurrent request gets back.
  async holdSeats(
    showtimeId: string,
    { seatIds }: CreateSeatHoldDto,
    userId: string,
  ): Promise<HoldSeatsResponseDto> {
    const showtime = await this.showtimes.findOne({
      where: { id: showtimeId },
    });

    if (!showtime) {
      throw new NotFoundException(`Showtime with id ${showtimeId} not found`);
    }

    this.assertBookable(showtime.status);

    const seats = await this.seats.find({
      where: { id: In(seatIds), hallId: showtime.hallId, isActive: true },
    });

    if (seats.length !== seatIds.length) {
      throw new BadRequestException(
        "One or more seats do not exist in this showtime's hall",
      );
    }

    const seatLabelsById = new Map(
      seats.map((seat) => [seat.id, seat.seatLabel]),
    );

    try {
      const holds = await this.seatHolds.manager.transaction(async (manager) =>
        manager.save(
          SeatHold,
          seatIds.map((seatId) =>
            manager.create(SeatHold, { showtimeId, seatId, userId }),
          ),
        ),
      );

      return {
        holds: holds.map(({ id, seatId, status, heldUntil }) => ({
          id,
          seatId,
          seatLabel: seatLabelsById.get(seatId)!,
          showtimeId,
          status,
          heldUntil,
        })),
      };
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new AppException(
          ErrorCode.SEAT_UNAVAILABLE,
          'One or more selected seats are no longer available',
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  private assertBookable(status: ShowtimeStatus): void {
    if (NOT_BOOKABLE_STATUSES.has(status)) {
      throw new AppException(
        ErrorCode.SHOWTIME_NOT_BOOKABLE,
        `A ${status} showtime cannot be booked`,
        HttpStatus.CONFLICT,
      );
    }
  }
}

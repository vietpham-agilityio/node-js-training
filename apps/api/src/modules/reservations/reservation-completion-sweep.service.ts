import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { showtimeEndInstant } from '../../common/utils/time.util';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatus } from './enums/reservation-status.enum';

// ADR-009's second job: every 15 minutes, mark CONFIRMED reservations whose
// showtime has finished as COMPLETED. Nothing else flips showtime.status as
// real time passes (ALLOWED_TRANSITIONS only fires on an admin PATCH), so
// "finished" is computed from show_date/show_time/end_time directly, the
// same way BR-28's overlap check already does — not read off showtime.status.
@Injectable()
export class ReservationCompletionSweepService {
  private readonly logger = new Logger(ReservationCompletionSweepService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
  ) {}

  @Cron('0 */15 * * * *')
  async completeFinishedReservations(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);

    const candidates = await this.reservations
      .createQueryBuilder('reservation')
      .innerJoinAndSelect('reservation.showtime', 'showtime')
      .where('reservation.status = :confirmed', {
        confirmed: ReservationStatus.CONFIRMED,
      })
      .andWhere('showtime.showDate <= :today', { today })
      .getMany();

    const now = new Date();
    const finishedIds = candidates
      .filter(
        ({ showtime }) =>
          showtimeEndInstant(
            showtime.showDate,
            showtime.showTime,
            showtime.endTime,
          ) <= now,
      )
      .map(({ id }) => id);

    if (finishedIds.length === 0) {
      return;
    }

    await this.reservations.update(
      { id: In(finishedIds) },
      { status: ReservationStatus.COMPLETED },
    );
    this.logger.log(`Completed ${finishedIds.length} finished reservation(s)`);
  }
}

import { Module } from '@nestjs/common';

import { ReservationsModule } from '../reservations/reservations.module';
import { ShowtimesModule } from '../showtimes/showtimes.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

// ADR-001: Reports owns no entities of its own — it reads across
// Reservations (Ticket, Reservation) and Showtimes (Showtime, Hall), the
// same cross-module repository pattern SeatHoldsService already uses to
// reach Showtime/Seat from ReservationsModule.
@Module({
  imports: [ReservationsModule, ShowtimesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

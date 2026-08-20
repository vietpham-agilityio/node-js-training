import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reservation } from './entities/reservation.entity';
import { SeatHold } from './entities/seat-hold.entity';
import { Ticket } from './entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeatHold, Reservation, Ticket])],
  exports: [TypeOrmModule],
})
export class ReservationsModule {}

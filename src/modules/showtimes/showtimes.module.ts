import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Hall } from './entities/hall.entity';
import { Seat } from './entities/seat.entity';
import { Showtime } from './entities/showtime.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, Seat, Showtime])],
  exports: [TypeOrmModule],
})
export class ShowtimesModule {}

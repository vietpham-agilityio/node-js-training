import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MoviesModule } from '../movies/movies.module';
import { Hall } from './entities/hall.entity';
import { Seat } from './entities/seat.entity';
import { Showtime } from './entities/showtime.entity';
import { HallsController } from './halls.controller';
import { HallsService } from './halls.service';
import { ShowtimesController } from './showtimes.controller';
import { ShowtimesService } from './showtimes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, Seat, Showtime]), MoviesModule],
  controllers: [HallsController, ShowtimesController],
  providers: [HallsService, ShowtimesService],
  exports: [TypeOrmModule],
})
export class ShowtimesModule {}

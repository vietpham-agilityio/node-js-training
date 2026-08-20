import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Genre } from './entities/genre.entity';
import { MovieGenre } from './entities/movie-genre.entity';
import { Movie } from './entities/movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre, MovieGenre])],
  exports: [TypeOrmModule],
})
export class MoviesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Genre } from './entities/genre.entity';
import { MovieGenre } from './entities/movie-genre.entity';
import { Movie } from './entities/movie.entity';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre, MovieGenre])],
  controllers: [GenresController, MoviesController],
  providers: [GenresService, MoviesService],
  exports: [TypeOrmModule],
})
export class MoviesModule {}

import { Effect, Layer } from 'effect';

// Schema
import { GenreMovie, MovieStatus } from '../../schemas/movie';

// Effect
import { moviesServiceEffect } from '../../services/movies';

// Service
import { MoviesService } from '../services/movies';

export const MoviesServiceLayer = Layer.effect(
  MoviesService,
  Effect.gen(function* () {
    return {
      getMovies: (status?: MovieStatus) =>
        moviesServiceEffect.getMovies(status),

      getMovieById: (id: string) => moviesServiceEffect.getMovieById(id),

      searchMoviesPaginated: (query: string, page?: number, limit?: number) =>
        moviesServiceEffect.searchMoviesPaginated(query, page, limit),

      getMoviesByGenre: (genre: GenreMovie) =>
        moviesServiceEffect.getMoviesByGenre(genre),

      getMoviesByGenrePaginated: (
        genre: GenreMovie,
        status?: MovieStatus,
        page?: number,
        limit?: number,
      ) =>
        moviesServiceEffect.getMoviesByGenrePaginated(
          genre,
          status,
          page,
          limit,
        ),

      getShowtimes: (movieId: string, date: string) =>
        moviesServiceEffect.getShowtimes(movieId, date),

      getShowtimeById: (id: string) => moviesServiceEffect.getShowtimeById(id),

      getMoviesPaginated: (
        status?: MovieStatus,
        page?: number,
        limit?: number,
      ) => moviesServiceEffect.getMoviesPaginated(status, page, limit),
    } as const;
  }),
);

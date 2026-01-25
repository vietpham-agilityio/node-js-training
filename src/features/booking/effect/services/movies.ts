// Effect
import { Effect, Context } from 'effect';

// Schema
import { GenreMovie, Movie, MovieStatus } from '../../schemas/movie';
import { MovieError } from '../../error/movie';
import { Showtime } from '../../schemas/cinema';

export class MoviesService extends Context.Tag('MoviesServiceTag')<
  MoviesService,
  {
    readonly getMovies: (
      status?: MovieStatus,
    ) => Effect.Effect<Movie[], MovieError, never>;

    readonly getMovieById: (
      id: string,
    ) => Effect.Effect<Movie, MovieError, never>;

    readonly searchMoviesPaginated: (
      query: string,
      page?: number,
      limit?: number,
    ) => Effect.Effect<Movie[], MovieError, never>;

    readonly getMoviesByGenre: (
      genre: GenreMovie,
    ) => Effect.Effect<Movie[], MovieError, never>;

    readonly getMoviesByGenrePaginated: (
      genre: GenreMovie,
      status?: MovieStatus,
      page?: number,
      limit?: number,
    ) => Effect.Effect<Movie[], MovieError, never>;

    readonly getShowtimes: (
      movieId: string,
      date: string,
    ) => Effect.Effect<Showtime[], MovieError, never>;

    readonly getShowtimeById: (
      id: string,
    ) => Effect.Effect<Showtime, MovieError, never>;

    readonly getMoviesPaginated: (
      status?: MovieStatus,
      page?: number,
      limit?: number,
    ) => Effect.Effect<Movie[], MovieError, never>;
  }
>() {}

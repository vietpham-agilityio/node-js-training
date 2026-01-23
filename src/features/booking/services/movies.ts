// Supabase
import { supabase } from '@/services/supabase/client';

// Effect
import { Effect } from 'effect';

// Types
import { Showtime, ShowtimeStatus } from '@/features/booking/schemas/cinema';
import { GenreMovie, Movie, MovieStatus } from '../schemas/movie';

// Utils
import { keysToCamel } from '@/utils/convert';

// Constants
import { PAGINATION } from '@/constants';
import { MOVIE_STATUS, SHOWTIME_STATUS } from '@/constants/status';

// Error
import { MovieError } from '@/features/booking/error/movie';

export class MoviesServiceEffect {
  private static instance: MoviesServiceEffect;

  private constructor() {}

  static getInstance(): MoviesServiceEffect {
    if (!MoviesServiceEffect.instance) {
      MoviesServiceEffect.instance = new MoviesServiceEffect();
    }
    return MoviesServiceEffect.instance;
  }

  getMovies = (status?: MovieStatus) =>
    Effect.tryPromise({
      try: async () => {
        let query = supabase
          .from('movies')
          .select('*')
          .order('release_date', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        } else {
          query = query.in('status', [
            MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            MOVIE_STATUS.COMING_SOON as MovieStatus,
          ]);
        }

        const { data, error } = await query;

        if (error) throw MovieError.movieNotFound(error.message);

        return keysToCamel(data) as Movie[];
      },
      catch: (error: unknown) =>
        MovieError.movieNotFound(error instanceof Error ? error.message : ''),
    });

  getMovieById = (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw MovieError.movieNotFound(error.message);

        return keysToCamel(data) as Movie;
      },
      catch: (error: unknown) =>
        MovieError.movieNotFound(error instanceof Error ? error.message : ''),
    });

  searchMoviesPaginated = (
    query: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .ilike('title', `%${query}%`)
          .in('status', [
            MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            MOVIE_STATUS.COMING_SOON as MovieStatus,
          ])
          .order('release_date', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (error) throw MovieError.searchFailed(error.message);

        return keysToCamel(data) as Movie[];
      },
      catch: (error: unknown) =>
        MovieError.searchFailed(error instanceof Error ? error.message : ''),
    });

  getMoviesByGenre = (genre: GenreMovie) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .contains('genre', [genre])
          .in('status', [
            MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            MOVIE_STATUS.COMING_SOON as MovieStatus,
          ]);

        if (error) throw MovieError.movieNetworkError(error.message);

        return keysToCamel(data) as Movie[];
      },
      catch: (error: unknown) =>
        MovieError.movieNetworkError(
          error instanceof Error ? error.message : '',
        ),
    });

  getMoviesByGenrePaginated = (
    genre: GenreMovie,
    status?: MovieStatus,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ) =>
    Effect.tryPromise({
      try: async () => {
        let query = supabase
          .from('movies')
          .select('*')
          .contains('genre', [genre])
          .order('release_date', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (status) {
          query = query.eq('status', status);
        } else {
          query = query.in('status', [
            MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            MOVIE_STATUS.COMING_SOON as MovieStatus,
          ]);
        }

        const { data, error } = await query;

        if (error) throw MovieError.movieNotFound(error.message);

        return keysToCamel(data) as Movie[];
      },
      catch: (error: unknown) =>
        MovieError.movieNotFound(error instanceof Error ? error.message : ''),
    });

  getShowtimes = (movieId: string, date: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('showtimes')
          .select('*, cinema_hall:cinema_halls(*, cinema:cinemas(*))')
          .eq('movie_id', movieId)
          .eq('show_date', date)
          .eq('status', SHOWTIME_STATUS.ACTIVE as ShowtimeStatus)
          .order('show_time', { ascending: true });

        if (error) throw MovieError.showtimeNotFound(error.message);

        return keysToCamel(data) as Showtime[];
      },
      catch: (error: unknown) =>
        MovieError.showtimeNotFound(
          error instanceof Error ? error.message : '',
        ),
    });

  getShowtimeById = (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data, error } = await supabase
          .from('showtimes')
          .select(
            '*, cinema_hall:cinema_halls(*, cinema:cinemas(*)), movie:movies(*)',
          )
          .eq('id', id)
          .single();

        if (error) throw MovieError.showtimeNotFound(error.message);

        return keysToCamel(data) as Showtime;
      },
      catch: (error: unknown) =>
        MovieError.showtimeNotFound(
          error instanceof Error ? error.message : '',
        ),
    });

  getMoviesPaginated = (
    status?: MovieStatus,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ) =>
    Effect.tryPromise({
      try: async () => {
        let query = supabase
          .from('movies')
          .select('*')
          .order('release_date', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (status) {
          query = query.eq('status', status);
        } else {
          query = query.in('status', [
            MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            MOVIE_STATUS.COMING_SOON as MovieStatus,
          ]);
        }

        const { data, error } = await query;

        if (error) throw MovieError.movieNotFound(error.message);

        return keysToCamel(data) as Movie[];
      },
      catch: (error: unknown) =>
        MovieError.movieNotFound(error instanceof Error ? error.message : ''),
    });
}

export const moviesServiceEffect = MoviesServiceEffect.getInstance();

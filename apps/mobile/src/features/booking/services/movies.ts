// Supabase — still backs the showtime reads until the showtimes migration
import { supabase } from '@/services/supabase/client';

// Effect
import { Effect } from 'effect';

// HTTP
import { apiRequest } from '@/services/api/client';

// Types
import type {
  Movie as ApiMovie,
  PaginatedGenres,
  PaginatedMovies,
} from '@movea/api-contract';
import { ShowtimeStatus } from '@/features/booking/schemas/cinema';
import { Movie, MovieStatus } from '../schemas/movie';

// Utils
import { keysToCamel } from '@/utils/convert';

// Constants
import { PAGINATION } from '@/constants';
import { SHOWTIME_STATUS } from '@/constants/status';

// Error
import { MovieError } from '@/features/booking/error/movie';

// A wider page than the shared default: status is filtered client-side after
// paging, so a bigger page keeps the "now playing" / "coming soon" carousels
// full (see useMovieData).
const PAGE_LIMIT = PAGINATION.PAGE_LIMIT_MAX;

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : '';

const toQuery = (
  params: Record<string, string | number | undefined>,
): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

// The API has no status field; "now playing" vs "coming soon" is a function of
// the release date.
const deriveStatus = (releaseDate: string): MovieStatus =>
  new Date(releaseDate).getTime() > Date.now() ? 'coming_soon' : 'now_playing';

const toMovie = ({
  id,
  title,
  synopsis,
  posterUrl,
  durationMinutes,
  language,
  releaseDate,
  rating,
  genres,
  createdAt,
  updatedAt,
}: ApiMovie): Movie => ({
  id,
  title,
  synopsis: synopsis ?? '',
  posterUrl: posterUrl ?? '',
  durationMinutes,
  language,
  releaseDate,
  rating: rating ?? 0,
  genre: genres.map(({ name }) => name),
  status: deriveStatus(releaseDate),
  createdAt,
  updatedAt,
});

export interface MoviePage {
  data: Movie[];
  page: number;
  hasMore: boolean;
}

const toMoviePage = ({ data, meta }: PaginatedMovies): MoviePage => ({
  data: data.map(toMovie),
  page: meta.page,
  hasMore: meta.hasMore,
});

export class MoviesServiceEffect {
  private static instance: MoviesServiceEffect;

  private constructor() {}

  static getInstance(): MoviesServiceEffect {
    if (!MoviesServiceEffect.instance) {
      MoviesServiceEffect.instance = new MoviesServiceEffect();
    }
    return MoviesServiceEffect.instance;
  }

  getMovieById = (id: string) =>
    Effect.tryPromise({
      try: async () => toMovie(await apiRequest<ApiMovie>(`/movies/${id}`)),
      catch: (error: unknown) => MovieError.movieNotFound(messageOf(error)),
    });

  getMoviesPaginated = (page = 1) =>
    Effect.tryPromise({
      try: async () =>
        toMoviePage(
          await apiRequest<PaginatedMovies>(
            `/movies${toQuery({ page, limit: PAGE_LIMIT })}`,
          ),
        ),
      catch: (error: unknown) => MovieError.movieNotFound(messageOf(error)),
    });

  searchMoviesPaginated = (query: string, page = 1) =>
    Effect.tryPromise({
      try: async () =>
        toMoviePage(
          await apiRequest<PaginatedMovies>(
            `/movies${toQuery({ title: query, page, limit: PAGE_LIMIT })}`,
          ),
        ),
      catch: (error: unknown) => MovieError.searchFailed(messageOf(error)),
    });

  getMoviesByGenrePaginated = (genreId: string, page = 1) =>
    Effect.tryPromise({
      try: async () =>
        toMoviePage(
          await apiRequest<PaginatedMovies>(
            `/movies${toQuery({ genreId, page, limit: PAGE_LIMIT })}`,
          ),
        ),
      catch: (error: unknown) => MovieError.movieNotFound(messageOf(error)),
    });

  getGenres = () =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await apiRequest<PaginatedGenres>(
          `/genres${toQuery({ limit: 100 })}`,
        );
        return data;
      },
      catch: (error: unknown) => MovieError.movieNetworkError(messageOf(error)),
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

        return keysToCamel(data);
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

        return keysToCamel(data);
      },
      catch: (error: unknown) =>
        MovieError.showtimeNotFound(
          error instanceof Error ? error.message : '',
        ),
    });
}

export const moviesServiceEffect = MoviesServiceEffect.getInstance();

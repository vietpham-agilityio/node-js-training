import { PAGINATION } from '@/constants';
import { SHOWTIME_STATUS, MOVIE_STATUS } from '@/constants/status';

// Types
import { Showtime, ShowtimeStatus } from '@/features/booking/schemas/cinema';
import { GenreMovie, Movie, MovieStatus } from '../schemas/movie';

// Utils
import { supabase } from '@/services/supabase/client';
import { keysToCamel } from '@/utils/convert';

export class MoviesService {
  private static instance: MoviesService;

  private constructor() {}

  static getInstance(): MoviesService {
    if (!MoviesService.instance) {
      MoviesService.instance = new MoviesService();
    }
    return MoviesService.instance;
  }

  async getMovies(status?: MovieStatus): Promise<Movie[]> {
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
    if (error) throw error;
    return keysToCamel(data) as Movie[];
  }

  async getMovieById(id: string): Promise<Movie> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return keysToCamel(data) as Movie;
  }

  async searchMoviesPaginated(
    query: string,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ): Promise<Movie[]> {
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

    if (error) throw error;
    return keysToCamel(data) as Movie[];
  }

  async getMoviesByGenre(genre: GenreMovie): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .contains('genre', [genre])
      .in('status', [
        MOVIE_STATUS.NOW_PLAYING as MovieStatus,
        MOVIE_STATUS.COMING_SOON as MovieStatus,
      ]);
    if (error) throw error;
    return keysToCamel(data) as Movie[];
  }

  async getMoviesByGenrePaginated(
    genre: GenreMovie,
    status?: MovieStatus,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ): Promise<Movie[]> {
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
    if (error) throw error;
    return keysToCamel(data) as Movie[];
  }

  async getShowtimes(movieId: string, date: string): Promise<Showtime[]> {
    const { data, error } = await supabase
      .from('showtimes')
      .select('*, cinema_hall:cinema_halls(*, cinema:cinemas(*))')
      .eq('movie_id', movieId)
      .eq('show_date', date)
      .eq('status', SHOWTIME_STATUS.ACTIVE as ShowtimeStatus)
      .order('show_time', { ascending: true });
    if (error) throw error;
    return keysToCamel(data) as Showtime[];
  }

  async getShowtimeById(id: string): Promise<Showtime> {
    const { data, error } = await supabase
      .from('showtimes')
      .select(
        '*, cinema_hall:cinema_halls(*, cinema:cinemas(*)), movie:movies(*)',
      )
      .eq('id', id)
      .single();
    if (error) throw error;
    return keysToCamel(data) as Showtime;
  }

  async getMoviesPaginated(
    status?: MovieStatus,
    page = PAGINATION.PAGE_OFFSET,
    limit = PAGINATION.PAGE_LIMIT,
  ): Promise<Movie[]> {
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
    if (error) throw error;
    return keysToCamel(data) as Movie[];
  }
}

export const moviesService = MoviesService.getInstance();

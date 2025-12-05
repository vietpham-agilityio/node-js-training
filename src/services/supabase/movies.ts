import { Movie, Showtime } from '@/types';
import { keysToCamel } from '@/utils';
import { supabase } from './client';

export class MoviesService {
  private static instance: MoviesService;

  private constructor() {}

  static getInstance(): MoviesService {
    if (!MoviesService.instance) {
      MoviesService.instance = new MoviesService();
    }
    return MoviesService.instance;
  }

  async getMovies(status?: 'now_playing' | 'coming_soon'): Promise<Movie[]> {
    let query = supabase
      .from('movies')
      .select('*')
      .order('release_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['now_playing', 'coming_soon']);
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

  async searchMovies(query: string): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', `%${query}%`)
      .in('status', ['now_playing', 'coming_soon']);
    if (error) throw error;
    return keysToCamel(data) as Movie[];
  }

  async getMoviesByGenre(genre: string): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .contains('genre', [genre])
      .in('status', ['now_playing', 'coming_soon']);
    if (error) throw error;
    return keysToCamel(data) as Movie[];
  }

  async getShowtimes(movieId: string, date: string): Promise<Showtime[]> {
    const { data, error } = await supabase
      .from('showtimes')
      .select('*, cinema_hall:cinema_halls(*, cinema:cinemas(*))')
      .eq('movie_id', movieId)
      .eq('show_date', date)
      .eq('status', 'active')
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
    status?: 'now_playing' | 'coming_soon',
    page = 0,
    limit = 10,
  ): Promise<Movie[]> {
    let query = supabase
      .from('movies')
      .select('*')
      .order('release_date', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['now_playing', 'coming_soon']);
    }

    const { data, error } = await query;
    if (error) throw error;
    return keysToCamel(data) as Movie[];
  }
}

export const moviesService = MoviesService.getInstance();

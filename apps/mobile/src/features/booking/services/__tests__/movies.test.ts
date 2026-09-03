// Supabase
import { supabase } from '@/services/supabase/client';

// Utils
import { keysToCamel } from '@/utils/convert';

// Services
import { MoviesServiceEffect, moviesServiceEffect } from '../movies';

// Constant
import { MOVIE_STATUS } from '@/constants/status';
import { GENRE_MOVIE } from '@/constants/movie';

// Type
import { GenreMovie } from '../../schemas/movie';

// Utils
import { runEffectForQuery } from '@/utils/effect';

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(),
  range: jest.fn().mockReturnThis(),
  then: jest.fn(),
};

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder),
  },
}));

jest.unmock('@/utils/convert');

describe('MoviesService', () => {
  let service: MoviesServiceEffect;
  const from = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = MoviesServiceEffect.getInstance();
    (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });
  });

  it('should be a singleton', () => {
    const instance1 = MoviesServiceEffect.getInstance();
    const instance2 = MoviesServiceEffect.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(moviesServiceEffect);
  });

  describe('getMovies', () => {
    it('should fetch movies with a specific status', async () => {
      const mockData = [{ title: 'Movie 1' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );

      const movies = await runEffectForQuery(
        moviesServiceEffect.getMovies(MOVIE_STATUS.NOW_PLAYING),
      );

      expect(from).toHaveBeenCalledWith('movies');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'status',
        MOVIE_STATUS.NOW_PLAYING,
      );
      expect(movies).toEqual(keysToCamel(mockData));
    });

    it('should fetch now playing and coming soon if no status', async () => {
      await runEffectForQuery(moviesServiceEffect.getMovies());
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('status', [
        MOVIE_STATUS.NOW_PLAYING,
        MOVIE_STATUS.COMING_SOON,
      ]);
    });
  });

  describe('getMovieById', () => {
    it('should fetch a single movie by ID', async () => {
      const mockMovie = { id: 'movie1' };
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockMovie,
        error: null,
      });
      const movie = await runEffectForQuery(
        moviesServiceEffect.getMovieById('movie1'),
      );
      expect(from).toHaveBeenCalledWith('movies');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'movie1');
      expect(movie).toEqual(keysToCamel(mockMovie));
    });
  });

  describe('getMoviesByGenre', () => {
    it('should fetch movies by genre', async () => {
      const mockData = [{ genre: ['Action'] }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );
      const movies = await runEffectForQuery(
        moviesServiceEffect.getMoviesByGenre(GENRE_MOVIE.ACTION as GenreMovie),
      );
      expect(mockQueryBuilder.contains).toHaveBeenCalledWith('genre', [
        'action',
      ]);
      expect(movies).toEqual(keysToCamel(mockData));
    });
  });

  describe('getShowtimes', () => {
    it('should fetch showtimes for a movie on a specific date', async () => {
      const mockData = [{ id: 'show1' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );
      const showtimes = await runEffectForQuery(
        moviesServiceEffect.getShowtimes('movie1', '2025-12-25'),
      );
      expect(from).toHaveBeenCalledWith('showtimes');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('movie_id', 'movie1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'show_date',
        '2025-12-25',
      );
      expect(showtimes).toEqual(keysToCamel(mockData));
    });
  });

  describe('getShowtimeById', () => {
    it('should fetch a single showtime by ID', async () => {
      const mockShowtime = { id: 'show1' };
      (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
        data: mockShowtime,
        error: null,
      });
      const showtime = await runEffectForQuery(
        moviesServiceEffect.getShowtimeById('show1'),
      );
      expect(from).toHaveBeenCalledWith('showtimes');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'show1');
      expect(showtime).toEqual(keysToCamel(mockShowtime));
    });
  });

  describe('getMoviesPaginated', () => {
    it('should fetch paginated movies', async () => {
      const mockData = [{ title: 'Movie 1' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );

      const movies = await runEffectForQuery(
        moviesServiceEffect.getMoviesPaginated(MOVIE_STATUS.NOW_PLAYING, 0, 10),
      );

      expect(from).toHaveBeenCalledWith('movies');
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
      expect(movies).toEqual(keysToCamel(mockData));
    });
  });
});

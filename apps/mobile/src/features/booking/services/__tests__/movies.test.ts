// HTTP
import { apiRequest } from '@/services/api/client';

// Supabase (still backs the showtime reads)
import { supabase } from '@/services/supabase/client';

// Utils
import { keysToCamel } from '@/utils/convert';
import { runEffectForQuery } from '@/utils/effect';

// Services
import { MoviesServiceEffect, moviesServiceEffect } from '../movies';

jest.mock('@/services/api/client', () => ({
  apiRequest: jest.fn(),
}));

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

const mockApiRequest = apiRequest as jest.Mock;

// `GET /movies/:id` payload — genres are {id,name} objects, no status field.
const API_MOVIE = {
  id: 'movie1',
  title: 'Movie 1',
  synopsis: 'Synopsis',
  posterUrl: 'https://example.com/p.jpg',
  durationMinutes: 120,
  language: 'en',
  releaseDate: '2000-01-01',
  rating: 7.5,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  genres: [{ id: 'g1', name: 'Action' }],
};

const apiPage = (items: unknown[], page = 1, hasMore = false) => ({
  data: items,
  meta: { page, limit: 20, total: items.length, hasMore },
});

describe('MoviesService', () => {
  const from = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });
  });

  it('should be a singleton', () => {
    expect(MoviesServiceEffect.getInstance()).toBe(moviesServiceEffect);
  });

  describe('getMovieById', () => {
    it('fetches a movie from /movies/:id and adapts it', async () => {
      mockApiRequest.mockResolvedValue(API_MOVIE);

      const movie = await runEffectForQuery(
        moviesServiceEffect.getMovieById('movie1'),
      );

      expect(mockApiRequest).toHaveBeenCalledWith('/movies/movie1');
      expect(movie).toMatchObject({
        id: 'movie1',
        genre: ['Action'],
        rating: 7.5,
        // 2000 release date → already showing
        status: 'now_playing',
      });
    });

    it('throws a MovieError when the request fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('boom'));

      await expect(
        runEffectForQuery(moviesServiceEffect.getMovieById('movie1')),
      ).rejects.toThrow('boom');
    });
  });

  describe('getMoviesPaginated', () => {
    it('requests a one-indexed page and returns { data, page, hasMore }', async () => {
      mockApiRequest.mockResolvedValue(apiPage([API_MOVIE], 1, true));

      const result = await runEffectForQuery(
        moviesServiceEffect.getMoviesPaginated(1),
      );

      expect(mockApiRequest).toHaveBeenCalledWith('/movies?page=1&limit=20');
      expect(result).toEqual({
        data: [
          expect.objectContaining({ id: 'movie1', status: 'now_playing' }),
        ],
        page: 1,
        hasMore: true,
      });
    });
  });

  describe('searchMoviesPaginated', () => {
    it('passes the query as ?title=', async () => {
      mockApiRequest.mockResolvedValue(apiPage([], 1, false));

      await runEffectForQuery(
        moviesServiceEffect.searchMoviesPaginated('bat', 2),
      );

      expect(mockApiRequest).toHaveBeenCalledWith(
        '/movies?title=bat&page=2&limit=20',
      );
    });
  });

  describe('getMoviesByGenrePaginated', () => {
    it('passes the genre id as ?genreId=', async () => {
      mockApiRequest.mockResolvedValue(apiPage([], 1, false));

      await runEffectForQuery(
        moviesServiceEffect.getMoviesByGenrePaginated('g1', 1),
      );

      expect(mockApiRequest).toHaveBeenCalledWith(
        '/movies?genreId=g1&page=1&limit=20',
      );
    });
  });

  describe('getGenres', () => {
    it('fetches the genre list from /genres', async () => {
      const genres = [{ id: 'g1', name: 'Action' }];
      mockApiRequest.mockResolvedValue(apiPage(genres));

      const result = await runEffectForQuery(moviesServiceEffect.getGenres());

      expect(mockApiRequest).toHaveBeenCalledWith('/genres?limit=100');
      expect(result).toEqual(genres);
    });
  });

  describe('getShowtimes (still Supabase)', () => {
    it('fetches showtimes for a movie on a specific date', async () => {
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

  describe('getShowtimeById (still Supabase)', () => {
    it('fetches a single showtime by ID', async () => {
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
});


import { MoviesService, moviesService } from '../movies';
import { supabase } from '@/services/supabase/client';
import { keysToCamel } from '@/utils/convert';
import { MovieStatus } from '../../types/movie';

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
  let service: MoviesService;
  const from = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = MoviesService.getInstance();
    (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
      resolve({ data: [], error: null }),
    );
    (mockQueryBuilder.single as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });
  });

  it('should be a singleton', () => {
    const instance1 = MoviesService.getInstance();
    const instance2 = MoviesService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(moviesService);
  });

  describe('getMovies', () => {
    it('should fetch movies with a specific status', async () => {
      const mockData = [{ title: 'Movie 1' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );

      const movies = await service.getMovies(MovieStatus.NOW_PLAYING);

      expect(from).toHaveBeenCalledWith('movies');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'status',
        MovieStatus.NOW_PLAYING,
      );
      expect(movies).toEqual(keysToCamel(mockData));
    });

    it('should fetch now playing and coming soon if no status', async () => {
      await service.getMovies();
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('status', [
        MovieStatus.NOW_PLAYING,
        MovieStatus.COMING_SOON,
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
      const movie = await service.getMovieById('movie1');
      expect(from).toHaveBeenCalledWith('movies');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'movie1');
      expect(movie).toEqual(keysToCamel(mockMovie));
    });
  });

  describe('searchMovies', () => {
    it('should search for movies by title', async () => {
      const mockData = [{ title: 'Search Result' }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );
      const movies = await service.searchMovies('Result');
      expect(mockQueryBuilder.ilike).toHaveBeenCalledWith('title', '%Result%');
      expect(movies).toEqual(keysToCamel(mockData));
    });
  });

  describe('getMoviesByGenre', () => {
    it('should fetch movies by genre', async () => {
      const mockData = [{ genre: ['Action'] }];
      (mockQueryBuilder.then as jest.Mock).mockImplementation(resolve =>
        resolve({ data: mockData, error: null }),
      );
      const movies = await service.getMoviesByGenre('Action');
      expect(mockQueryBuilder.contains).toHaveBeenCalledWith('genre', [
        'Action',
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
      const showtimes = await service.getShowtimes('movie1', '2025-12-25');
      expect(from).toHaveBeenCalledWith('showtimes');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('movie_id', 'movie1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('show_date', '2025-12-25');
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
      const showtime = await service.getShowtimeById('show1');
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

      const movies = await service.getMoviesPaginated(
        MovieStatus.NOW_PLAYING,
        0,
        10,
      );

      expect(from).toHaveBeenCalledWith('movies');
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
      expect(movies).toEqual(keysToCamel(mockData));
    });
  });
});

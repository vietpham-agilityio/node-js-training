import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Hooks
import {
  useMovie,
  useMovies,
  useMoviesByGenre,
  useMoviesInfinite,
} from '../useMovies';

// Types
import { GenreMovie, MovieStatus } from '@/features/booking/schemas/movie';
import { MOVIE_STATUS } from '@/constants/status';
import { GENRE_MOVIE } from '@/constants/movie';

// Mock dependencies
const mockGetMovies = jest.fn();
const mockGetMoviesPaginated = jest.fn();
const mockGetMovieById = jest.fn();
const mockSearchMovies = jest.fn();
const mockGetMoviesByGenre = jest.fn();

jest.mock('@/features/booking/services/movies', () => ({
  moviesService: {
    getMovies: (status?: MovieStatus) => mockGetMovies(status),
    getMoviesPaginated: (status: MovieStatus, page: number, limit: number) =>
      mockGetMoviesPaginated(status, page, limit),
    getMovieById: (id: string) => mockGetMovieById(id),
    searchMovies: (query: string) => mockSearchMovies(query),
    getMoviesByGenre: (genre: string) => mockGetMoviesByGenre(genre),
  },
}));

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('useMovies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch movies with default options', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', status: MOVIE_STATUS.NOW_PLAYING },
      { id: '2', title: 'Movie 2', status: MOVIE_STATUS.NOW_PLAYING },
    ];
    mockGetMovies.mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMovies).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(mockMovies);
  });

  it('should fetch movies with status filter', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', status: MOVIE_STATUS.COMING_SOON },
    ];
    mockGetMovies.mockResolvedValue(mockMovies);

    const { result } = renderHook(
      () => useMovies({ status: MOVIE_STATUS.COMING_SOON }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMovies).toHaveBeenCalledWith(MOVIE_STATUS.COMING_SOON);
    expect(result.current.data).toEqual(mockMovies);
  });

  it('should not fetch when enabled is false', () => {
    renderHook(() => useMovies({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(mockGetMovies).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch movies');
    mockGetMovies.mockRejectedValue(mockError);

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useMoviesInfinite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch first page of movies', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1' },
      { id: '2', title: 'Movie 2' },
    ];
    mockGetMoviesPaginated.mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useMoviesInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMoviesPaginated).toHaveBeenCalledWith(undefined, 0, 10);
    expect(result.current.data?.pages[0]).toEqual(mockMovies);
  });

  it('should fetch next page when fetchNextPage is called', async () => {
    const page1 = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Movie ${i + 1}`,
    })); // Exactly PAGE_LIMIT items to trigger next page
    const page2 = [{ id: '11', title: 'Movie 11' }];
    mockGetMoviesPaginated
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const { result } = renderHook(() => useMoviesInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]).toEqual(page1);
    expect(result.current.hasNextPage).toBe(true);

    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages.length).toBe(2);
    });

    expect(mockGetMoviesPaginated).toHaveBeenCalledTimes(2);
    expect(result.current.data?.pages[1]).toEqual(page2);
  });

  it('should return next page number when last page has PAGE_LIMIT items', async () => {
    const fullPage = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Movie ${i + 1}`,
    }));
    mockGetMoviesPaginated.mockResolvedValue(fullPage);

    const { result } = renderHook(() => useMoviesInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // When page has exactly PAGE_LIMIT items, hasNextPage should be true
    // This means getNextPageParam returned allPages.length (line 43)
    expect(result.current.hasNextPage).toBe(true);
    expect(result?.current?.data?.pages[0]?.length || 0).toBe(10);
  });

  it('should return allPages.length for subsequent pages when they have PAGE_LIMIT items', async () => {
    // First page with exactly PAGE_LIMIT items
    const page1 = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Movie ${i + 1}`,
    }));
    // Second page with exactly PAGE_LIMIT items
    const page2 = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 11}`,
      title: `Movie ${i + 11}`,
    }));
    // Third page with fewer items (end of data)
    const page3 = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 21}`,
      title: `Movie ${i + 21}`,
    }));

    mockGetMoviesPaginated
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2)
      .mockResolvedValueOnce(page3);

    const { result } = renderHook(() => useMoviesInfinite(), {
      wrapper: createWrapper(),
    });

    // Wait for first page
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(true); // Page 1 has 10 items, should have next page

    // Fetch second page
    result.current.fetchNextPage();
    await waitFor(() => {
      expect(result.current.data?.pages.length).toBe(2);
    });

    expect(result.current.hasNextPage).toBe(true); // Page 2 has 10 items, should have next page

    // Fetch third page
    result.current.fetchNextPage();
    await waitFor(() => {
      expect(result.current.data?.pages.length).toBe(3);
    });

    // Page 3 has only 5 items (< PAGE_LIMIT), so no next page
    expect(result.current.hasNextPage).toBe(false);
    expect(mockGetMoviesPaginated).toHaveBeenCalledTimes(3);
  });

  it('should return undefined for nextPageParam when last page has fewer items', async () => {
    const mockMovies = [{ id: '1', title: 'Movie 1' }]; // Less than page limit
    mockGetMoviesPaginated.mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useMoviesInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it('should not fetch when enabled is false', () => {
    renderHook(() => useMoviesInfinite({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(mockGetMoviesPaginated).not.toHaveBeenCalled();
  });
});

describe('useMovie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch movie by id when id is provided', async () => {
    const mockMovie = {
      id: '1',
      title: 'Movie 1',
      status: MOVIE_STATUS.NOW_PLAYING,
    };
    mockGetMovieById.mockResolvedValue(mockMovie);

    const { result } = renderHook(() => useMovie('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMovieById).toHaveBeenCalledWith('1');
    expect(result.current.data).toEqual(mockMovie);
  });

  it('should not fetch when id is empty', () => {
    renderHook(() => useMovie(''), {
      wrapper: createWrapper(),
    });

    expect(mockGetMovieById).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch movie');
    mockGetMovieById.mockRejectedValue(mockError);

    const { result } = renderHook(() => useMovie('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useMoviesByGenre', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch movies by genre when genre is valid', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', genre: ['Action'] },
      { id: '2', title: 'Movie 2', genre: ['Action'] },
    ];
    mockGetMoviesByGenre.mockResolvedValue(mockMovies);

    const { result } = renderHook(
      () => useMoviesByGenre(GENRE_MOVIE.ACTION as GenreMovie),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetMoviesByGenre).toHaveBeenCalledWith(GENRE_MOVIE.ACTION);
    expect(result.current.data).toEqual(mockMovies);
  });

  it('should not fetch when genre is "All"', () => {
    renderHook(() => useMoviesByGenre(GENRE_MOVIE.ALL as GenreMovie), {
      wrapper: createWrapper(),
    });

    expect(mockGetMoviesByGenre).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch movies by genre');
    mockGetMoviesByGenre.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useMoviesByGenre(GENRE_MOVIE.ACTION as GenreMovie),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

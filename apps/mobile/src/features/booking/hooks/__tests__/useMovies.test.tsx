import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { Effect } from 'effect';
import React from 'react';

// Hooks
import {
  useMovie,
  useMovies,
  useMoviesByGenre,
  useMoviesInfinite,
} from '../useMovies';

// Services
import { moviesServiceEffect } from '@/features/booking/services/movies';

// Types
import { GENRE_MOVIE } from '@/constants/movie';
import { MOVIE_STATUS } from '@/constants/status';
import { MovieError } from '@/features/booking/error/movie';
import { GenreMovie } from '@/features/booking/schemas/movie';

jest.mock('@/features/booking/services/movies', () => ({
  moviesServiceEffect: {
    getMovies: jest.fn(),
    getMoviesPaginated: jest.fn(),
    getMovieById: jest.fn(),
    searchMoviesPaginated: jest.fn(),
    getMoviesByGenre: jest.fn(),
    getMoviesByGenrePaginated: jest.fn(),
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
    (moviesServiceEffect.getMovies as jest.Mock).mockReturnValue(
      Effect.succeed(mockMovies),
    );

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(moviesServiceEffect.getMovies).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(mockMovies);
  });

  it('should fetch movies with status filter', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', status: MOVIE_STATUS.COMING_SOON },
    ];
    (moviesServiceEffect.getMovies as jest.Mock).mockReturnValue(
      Effect.succeed(mockMovies),
    );

    const { result } = renderHook(
      () => useMovies({ status: MOVIE_STATUS.COMING_SOON }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(moviesServiceEffect.getMovies).toHaveBeenCalledWith(
      MOVIE_STATUS.COMING_SOON,
    );
    expect(result.current.data).toEqual(mockMovies);
  });

  it('should not fetch when enabled is false', () => {
    renderHook(() => useMovies({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(moviesServiceEffect.getMovies).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = MovieError.movieNetworkError('Failed to fetch movies');
    (moviesServiceEffect.getMovies as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(MovieError);
    expect((result.current.error as MovieError).message).toBe(
      'Failed to fetch movies',
    );
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
    (moviesServiceEffect.getMoviesPaginated as jest.Mock).mockReturnValue(
      Effect.succeed(mockMovies),
    );

    const { result } = renderHook(() => useMoviesInfinite(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(moviesServiceEffect.getMoviesPaginated).toHaveBeenCalledWith(
      undefined,
      0,
      10,
    );
    expect(result.current.data?.pages[0]).toEqual(mockMovies);
  });

  it('should fetch next page when fetchNextPage is called', async () => {
    const page1 = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Movie ${i + 1}`,
    })); // Exactly PAGE_LIMIT items to trigger next page
    const page2 = [{ id: '11', title: 'Movie 11' }];
    (moviesServiceEffect.getMoviesPaginated as jest.Mock)
      .mockReturnValueOnce(Effect.succeed(page1))
      .mockReturnValueOnce(Effect.succeed(page2));

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

    expect(moviesServiceEffect.getMoviesPaginated).toHaveBeenCalledTimes(2);
    expect(result.current.data?.pages[1]).toEqual(page2);
  });

  it('should return next page number when last page has PAGE_LIMIT items', async () => {
    const fullPage = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Movie ${i + 1}`,
    }));
    (moviesServiceEffect.getMoviesPaginated as jest.Mock).mockReturnValue(
      Effect.succeed(fullPage),
    );

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

    (moviesServiceEffect.getMoviesPaginated as jest.Mock)
      .mockReturnValueOnce(Effect.succeed(page1))
      .mockReturnValueOnce(Effect.succeed(page2))
      .mockReturnValueOnce(Effect.succeed(page3));

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
    expect(moviesServiceEffect.getMoviesPaginated).toHaveBeenCalledTimes(3);
  });

  it('should return undefined for nextPageParam when last page has fewer items', async () => {
    const mockMovies = [{ id: '1', title: 'Movie 1' }]; // Less than page limit
    (moviesServiceEffect.getMoviesPaginated as jest.Mock).mockReturnValue(
      Effect.succeed(mockMovies),
    );

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

    expect(moviesServiceEffect.getMoviesPaginated).not.toHaveBeenCalled();
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
    (moviesServiceEffect.getMovieById as jest.Mock).mockReturnValue(
      Effect.succeed(mockMovie),
    );

    const { result } = renderHook(() => useMovie('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(moviesServiceEffect.getMovieById).toHaveBeenCalledWith('1');
    expect(result.current.data).toEqual(mockMovie);
  });

  it('should not fetch when id is empty', () => {
    renderHook(() => useMovie(''), {
      wrapper: createWrapper(),
    });

    expect(moviesServiceEffect.getMovieById).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = MovieError.movieNotFound('Failed to fetch movie');
    (moviesServiceEffect.getMovieById as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useMovie('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(MovieError);
    expect((result.current.error as MovieError).message).toBe(
      'Failed to fetch movie',
    );
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
    (moviesServiceEffect.getMoviesByGenre as jest.Mock).mockReturnValue(
      Effect.succeed(mockMovies),
    );

    const { result } = renderHook(
      () => useMoviesByGenre(GENRE_MOVIE.ACTION as GenreMovie),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(moviesServiceEffect.getMoviesByGenre).toHaveBeenCalledWith(
      GENRE_MOVIE.ACTION,
    );
    expect(result.current.data).toEqual(mockMovies);
  });

  it('should not fetch when genre is "All"', () => {
    renderHook(() => useMoviesByGenre(GENRE_MOVIE.ALL as GenreMovie), {
      wrapper: createWrapper(),
    });

    expect(moviesServiceEffect.getMoviesByGenre).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = MovieError.movieNetworkError(
      'Failed to fetch movies by genre',
    );
    (moviesServiceEffect.getMoviesByGenre as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(
      () => useMoviesByGenre(GENRE_MOVIE.ACTION as GenreMovie),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(MovieError);
    expect((result.current.error as MovieError).message).toBe(
      'Failed to fetch movies by genre',
    );
  });
});

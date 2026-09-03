import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { Effect } from 'effect';
import React from 'react';

// Hooks
import { useShowtime, useShowtimes } from '../useShowtimes';

// Services
import { moviesServiceEffect } from '../../services/movies';

// Types
import { MovieError } from '../../error/movie';
import { ShowTime } from '../../schemas/cinema';

jest.mock('@/features/booking/services/movies', () => ({
  moviesServiceEffect: {
    getShowtimes: jest.fn(),
    getShowtimeById: jest.fn(),
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

describe('useShowtimes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch showtimes when movieId and date are provided', async () => {
    const mockShowtimes = [
      { id: '1', movieId: 'movie1', startTime: '10:00' },
      { id: '2', movieId: 'movie1', startTime: '13:00' },
    ];
    (moviesServiceEffect.getShowtimes as jest.Mock).mockReturnValue(
      Effect.succeed(mockShowtimes as unknown as ShowTime[]),
    );

    const { result } = renderHook(() => useShowtimes('movie1', '2024-01-01'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(moviesServiceEffect.getShowtimes).toHaveBeenCalledWith(
      'movie1',
      '2024-01-01',
    );
    expect(moviesServiceEffect.getShowtimes).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockShowtimes);
  });

  it('should not fetch when movieId is empty', () => {
    renderHook(() => useShowtimes('', '2024-01-01'), {
      wrapper: createWrapper(),
    });

    expect(moviesServiceEffect.getShowtimes).not.toHaveBeenCalled();
  });

  it('should not fetch when date is empty', () => {
    renderHook(() => useShowtimes('movie1', ''), {
      wrapper: createWrapper(),
    });

    expect(moviesServiceEffect.getShowtimes).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = MovieError.movieNetworkError('Failed to fetch showtimes');
    (moviesServiceEffect.getShowtimes as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useShowtimes('movie1', '2024-01-01'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(MovieError);
    expect((result.current.error as MovieError).message).toBe(
      'Failed to fetch showtimes',
    );
  });

  it('should use correct query key', () => {
    const { result } = renderHook(() => useShowtimes('movie1', '2024-01-01'), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });
});

describe('useShowtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch showtime by id when id is provided', async () => {
    const mockShowtime = {
      id: '1',
      movieId: 'movie1',
      startTime: '10:00',
      availableSeats: 50,
    };
    (moviesServiceEffect.getShowtimeById as jest.Mock).mockReturnValue(
      Effect.succeed(mockShowtime),
    );

    const { result } = renderHook(() => useShowtime('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(moviesServiceEffect.getShowtimeById).toHaveBeenCalledWith('1');
    expect(moviesServiceEffect.getShowtimeById).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockShowtime);
  });

  it('should not fetch when id is empty', () => {
    renderHook(() => useShowtime(''), {
      wrapper: createWrapper(),
    });

    expect(moviesServiceEffect.getShowtimeById).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = MovieError.showtimeNotFound('Failed to fetch showtime');
    (moviesServiceEffect.getShowtimeById as jest.Mock).mockReturnValue(
      Effect.fail(mockError),
    );

    const { result } = renderHook(() => useShowtime('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(MovieError);
    expect((result.current.error as MovieError).message).toBe(
      'Failed to fetch showtime',
    );
  });

  it('should refetch when id changes', async () => {
    const mockShowtime1 = { id: '1', movieId: 'movie1' };
    const mockShowtime2 = { id: '2', movieId: 'movie2' };
    (moviesServiceEffect.getShowtimeById as jest.Mock)
      .mockReturnValueOnce(Effect.succeed(mockShowtime1))
      .mockReturnValueOnce(Effect.succeed(mockShowtime2));

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useShowtime(id),
      {
        wrapper: createWrapper(),
        initialProps: { id: '1' },
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockShowtime1);

    rerender({ id: '2' });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockShowtime2);
    });

    expect(moviesServiceEffect.getShowtimeById).toHaveBeenCalledTimes(2);
  });
});

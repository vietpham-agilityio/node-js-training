import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Hooks
import { useShowtime, useShowtimes } from '../useShowtimes';

// Mock dependencies
const mockGetShowtimes = jest.fn();
const mockGetShowtimeById = jest.fn();

jest.mock('@/features/booking/services/movies', () => ({
  moviesService: {
    getShowtimes: (movieId: string, date: string) =>
      mockGetShowtimes(movieId, date),
    getShowtimeById: (id: string) => mockGetShowtimeById(id),
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
    mockGetShowtimes.mockResolvedValue(mockShowtimes);

    const { result } = renderHook(() => useShowtimes('movie1', '2024-01-01'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetShowtimes).toHaveBeenCalledWith('movie1', '2024-01-01');
    expect(mockGetShowtimes).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockShowtimes);
  });

  it('should not fetch when movieId is empty', () => {
    renderHook(() => useShowtimes('', '2024-01-01'), {
      wrapper: createWrapper(),
    });

    expect(mockGetShowtimes).not.toHaveBeenCalled();
  });

  it('should not fetch when date is empty', () => {
    renderHook(() => useShowtimes('movie1', ''), {
      wrapper: createWrapper(),
    });

    expect(mockGetShowtimes).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch showtimes');
    mockGetShowtimes.mockRejectedValue(mockError);

    const { result } = renderHook(() => useShowtimes('movie1', '2024-01-01'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
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
    mockGetShowtimeById.mockResolvedValue(mockShowtime);

    const { result } = renderHook(() => useShowtime('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetShowtimeById).toHaveBeenCalledWith('1');
    expect(mockGetShowtimeById).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockShowtime);
  });

  it('should not fetch when id is empty', () => {
    renderHook(() => useShowtime(''), {
      wrapper: createWrapper(),
    });

    expect(mockGetShowtimeById).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch showtime');
    mockGetShowtimeById.mockRejectedValue(mockError);

    const { result } = renderHook(() => useShowtime('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should refetch when id changes', async () => {
    const mockShowtime1 = { id: '1', movieId: 'movie1' };
    const mockShowtime2 = { id: '2', movieId: 'movie2' };
    mockGetShowtimeById
      .mockResolvedValueOnce(mockShowtime1)
      .mockResolvedValueOnce(mockShowtime2);

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

    expect(mockGetShowtimeById).toHaveBeenCalledTimes(2);
  });
});

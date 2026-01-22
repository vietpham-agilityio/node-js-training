// Constants
import { API_CONFIG, queryKeys } from '@/constants';

// Services
import { moviesServiceEffect } from '@/features/booking/services/movies';

// React Query
import { useQuery } from '@tanstack/react-query';

// Utils
import { runEffectForQuery } from '@/utils/effect';

export function useShowtimes(movieId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.showtimes.list(movieId, date),
    queryFn: () =>
      runEffectForQuery(moviesServiceEffect.getShowtimes(movieId, date)),
    enabled: !!movieId && !!date,
    staleTime: API_CONFIG.MOVIE_STALE_TIME,
  });
}

export function useShowtime(id: string) {
  return useQuery({
    queryKey: queryKeys.showtimes.detail(id),
    queryFn: () => runEffectForQuery(moviesServiceEffect.getShowtimeById(id)),
    enabled: !!id,
    staleTime: API_CONFIG.MOVIE_STALE_TIME,
  });
}

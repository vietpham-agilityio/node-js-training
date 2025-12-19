// Constants
import { API_CONFIG, queryKeys } from '@/constants';

// Services
import { moviesService } from '@/features/booking/services/movies';

// React Query
import { useQuery } from '@tanstack/react-query';

export function useShowtimes(movieId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.showtimes.list(movieId, date),
    queryFn: () => moviesService.getShowtimes(movieId, date),
    enabled: !!movieId && !!date,
    staleTime: API_CONFIG.MOVIE_STALE_TIME,
  });
}

export function useShowtime(id: string) {
  return useQuery({
    queryKey: queryKeys.showtimes.detail(id),
    queryFn: () => moviesService.getShowtimeById(id),
    enabled: !!id,
    staleTime: API_CONFIG.MOVIE_STALE_TIME,
  });
}

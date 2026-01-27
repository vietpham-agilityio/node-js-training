// Effect
import { Effect } from 'effect';

// Constants
import { API_CONFIG, queryKeys } from '@/constants';

// React Query
import { useQuery } from '@tanstack/react-query';

// Utils
import { runEffectForQuery } from '@/utils/effect';

// Effect Services
import { MoviesService } from '@/features/booking/effect/services/movies';
import { MoviesServiceLayer } from '@/features/booking/effect/layer/movies';

export function useShowtimes(movieId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.showtimes.list(movieId, date),
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getShowtimes(movieId, date);
        }),
        MoviesServiceLayer,
      ),
    enabled: !!movieId && !!date,
    staleTime: API_CONFIG.MOVIE_STALE_TIME,
  });
}

export function useShowtime(id: string) {
  return useQuery({
    queryKey: queryKeys.showtimes.detail(id),
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getShowtimeById(id);
        }),
        MoviesServiceLayer,
      ),
    enabled: !!id,
    staleTime: API_CONFIG.MOVIE_STALE_TIME,
  });
}

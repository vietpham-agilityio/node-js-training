// Effect
import { Effect } from 'effect';

// React Query
import { useQuery } from '@tanstack/react-query';

// Constants
import { API_CONFIG, queryKeys } from '@/constants';

// Utils
import { runEffectForQuery } from '@/utils/effect';

// Effect Services
import { MoviesService } from '@/features/booking/effect/services/movies';
import { MoviesServiceLayer } from '@/features/booking/effect/layer/movies';

/** The catalogue genres — `GET /genres`. Drives the Home genre filter tabs. */
export const useGenres = () =>
  useQuery({
    queryKey: queryKeys.genres.list(),
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getGenres();
        }),
        MoviesServiceLayer,
      ),
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });

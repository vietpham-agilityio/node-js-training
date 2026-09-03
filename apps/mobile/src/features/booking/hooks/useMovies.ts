// Effect
import { Effect } from 'effect';

// Constants
import { API_CONFIG, PAGINATION, queryKeys } from '@/constants';

// Types
import { GenreMovie, MovieStatus } from '@/features/booking/schemas/movie';

// React Query
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

// Utils
import { runEffectForQuery } from '@/utils/effect';

// Effect Services
import { MoviesService } from '@/features/booking/effect/services/movies';
import { MoviesServiceLayer } from '@/features/booking/effect/layer/movies';

interface UseMoviesOptions {
  status?: MovieStatus;
  enabled?: boolean;
}

interface UseMoviesByGenreOptions extends UseMoviesOptions {
  genre: GenreMovie;
}

interface UseSearchMoviesInfiniteOptions extends UseMoviesOptions {
  searchQuery?: string;
}

export const useMovies = (options: UseMoviesOptions = {}) => {
  const { status, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.movies.list({ status }),
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getMovies(status);
        }),
        MoviesServiceLayer,
      ),
    enabled,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
    gcTime: API_CONFIG.SEAT_RESERVATION_TIMEOUT,
  });
};

export const useMoviesInfinite = (options: UseMoviesOptions = {}) => {
  const { status, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.movies.infinite({ status }),
    queryFn: ({ pageParam = PAGINATION.PAGE_OFFSET }) =>
      runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getMoviesPaginated(
            status,
            pageParam,
            PAGINATION.PAGE_LIMIT,
          );
        }),
        MoviesServiceLayer,
      ),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGINATION.PAGE_LIMIT) return undefined;
      return allPages.length;
    },
    initialPageParam: PAGINATION.PAGE_OFFSET,
    enabled,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: queryKeys.movies.detail(id),
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getMovieById(id);
        }),
        MoviesServiceLayer,
      ),
    enabled: !!id,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useSearchMoviesInfinite = (
  options: UseSearchMoviesInfiniteOptions = {},
) => {
  const { searchQuery, status, enabled = true } = options;

  const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0);

  const infiniteQuery = useInfiniteQuery({
    queryKey: isSearching
      ? queryKeys.movies.searchInfinite(searchQuery!)
      : queryKeys.movies.infinite({ status }),

    queryFn: ({ pageParam = PAGINATION.PAGE_OFFSET }) => {
      if (isSearching) {
        // Search with pagination
        return runEffectForQuery(
          Effect.gen(function* () {
            const moviesService = yield* MoviesService;
            return yield* moviesService.searchMoviesPaginated(
              searchQuery!,
              pageParam,
              PAGINATION.PAGE_LIMIT,
            );
          }),
          MoviesServiceLayer,
        );
      }

      // Regular browse with pagination
      return runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getMoviesPaginated(
            status,
            pageParam,
            PAGINATION.PAGE_LIMIT,
          );
        }),
        MoviesServiceLayer,
      );
    },

    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGINATION.PAGE_LIMIT) return undefined;
      return allPages.length;
    },

    initialPageParam: PAGINATION.PAGE_OFFSET,
    enabled,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });

  // Transform the data to a flat array
  const movies = infiniteQuery.data?.pages.flat() ?? [];

  return {
    ...infiniteQuery,
    movies,
  };
};

export const useMoviesByGenre = (genre: GenreMovie) => {
  return useQuery({
    queryKey: queryKeys.movies.list({ genre }),
    queryFn: () =>
      runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getMoviesByGenre(genre);
        }),
        MoviesServiceLayer,
      ),
    enabled: genre !== 'all' && genre.length > 0,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useMoviesByGenreInfinite = (options: UseMoviesByGenreOptions) => {
  const { genre, status, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.movies.infinite({ genre, status }),
    queryFn: ({ pageParam = PAGINATION.PAGE_OFFSET }) =>
      runEffectForQuery(
        Effect.gen(function* () {
          const moviesService = yield* MoviesService;
          return yield* moviesService.getMoviesByGenrePaginated(
            genre,
            status,
            pageParam,
            PAGINATION.PAGE_LIMIT,
          );
        }),
        MoviesServiceLayer,
      ),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGINATION.PAGE_LIMIT) return undefined;
      return allPages.length;
    },
    initialPageParam: PAGINATION.PAGE_OFFSET,
    enabled: enabled && genre.length > 0,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

import { API_CONFIG, PAGINATION, queryKeys } from '@/constants';
import { moviesService } from '@/services/supabase';
import { MovieStatus } from '@/types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

interface UseMoviesOptions {
  status?: MovieStatus;
  enabled?: boolean;
}

export const useMovies = (options: UseMoviesOptions = {}) => {
  const { status, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.movies.list({ status }),
    queryFn: () => moviesService.getMovies(status),
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
      moviesService.getMoviesPaginated(
        status,
        pageParam,
        PAGINATION.PAGE_LIMIT,
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
    queryFn: () => moviesService.getMovieById(id),
    enabled: !!id,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useSearchMovies = (query: string) => {
  return useQuery({
    queryKey: queryKeys.movies.search(query),
    queryFn: () => moviesService.searchMovies(query),
    enabled: query.length > 2,
    staleTime: API_CONFIG.SEARCH_MOVIE_STALE_TIME,
  });
};

export const useMoviesByGenre = (genre: string) => {
  return useQuery({
    queryKey: queryKeys.movies.list({ genre }),
    queryFn: () => moviesService.getMoviesByGenre(genre),
    enabled: genre !== 'All' && genre.length > 0,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

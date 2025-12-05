import { queryKeys } from '@/constants';
import { moviesService } from '@/services/supabase';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

interface UseMoviesOptions {
  status?: 'now_playing' | 'coming_soon';
  enabled?: boolean;
}

export const useMovies = (options: UseMoviesOptions = {}) => {
  const { status, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.movies.list({ status }),
    queryFn: () => moviesService.getMovies(status),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useMoviesInfinite = (options: UseMoviesOptions = {}) => {
  const { status, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.movies.infinite({ status }),
    queryFn: ({ pageParam = 0 }) =>
      moviesService.getMoviesPaginated(status, pageParam, 10),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: queryKeys.movies.detail(id),
    queryFn: () => moviesService.getMovieById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchMovies = (query: string) => {
  return useQuery({
    queryKey: queryKeys.movies.search(query),
    queryFn: () => moviesService.searchMovies(query),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMoviesByGenre = (genre: string) => {
  return useQuery({
    queryKey: queryKeys.movies.list({ genre }),
    queryFn: () => moviesService.getMoviesByGenre(genre),
    enabled: genre !== 'All' && genre.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

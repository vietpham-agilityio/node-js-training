// Constants
import { API_CONFIG, PAGINATION, queryKeys } from '@/constants';

// Services
import { moviesService } from '@/features/booking/services/movies';

// Types
import { GenreMovie, MovieStatus } from '../types/movie';

// React Query
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

interface UseMoviesOptions {
  status?: MovieStatus;
  enabled?: boolean;
}

interface UseMoviesByGenreOptions {
  genre: GenreMovie;
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
    enabled: query.length > 0,
    staleTime: API_CONFIG.MOVIE_STALE_TIME,
  });
};

export const useMoviesByGenre = (genre: GenreMovie) => {
  return useQuery({
    queryKey: queryKeys.movies.list({ genre }),
    queryFn: () => moviesService.getMoviesByGenre(genre),
    enabled: genre !== 'all' && genre.length > 0,
    staleTime: API_CONFIG.QUERY_STALE_TIME,
  });
};

export const useMoviesByGenreInfinite = (options: UseMoviesByGenreOptions) => {
  const { genre, status, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.movies.infinite({ genre, status }),
    queryFn: ({ pageParam = PAGINATION.PAGE_OFFSET }) =>
      moviesService.getMoviesByGenrePaginated(
        genre,
        status,
        pageParam,
        PAGINATION.PAGE_LIMIT,
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

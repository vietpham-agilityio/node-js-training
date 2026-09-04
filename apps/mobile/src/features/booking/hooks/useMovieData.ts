import { useMemo } from 'react';
import { MovieStatus } from '@/features/booking/schemas/movie';
import { useMoviesByGenreInfinite, useMoviesInfinite } from './useMovies';
import { MOVIE_STATUS } from '@/constants/status';

interface UseMovieDataParams {
  status: MovieStatus;
  // A genre id from `GET /genres`; undefined means the "All" tab.
  genreId?: string;
  enabled?: boolean;
}

export const useMovieData = ({
  status,
  genreId,
  enabled = true,
}: UseMovieDataParams) => {
  const isAllCategory = !genreId;

  // Fetch all movies
  const allMoviesQuery = useMoviesInfinite({
    enabled: enabled && isAllCategory,
  });

  // Fetch movies by genre
  const genreMoviesQuery = useMoviesByGenreInfinite({
    genreId: genreId ?? '',
    enabled: enabled && !isAllCategory,
  });

  // Select active query based on category
  const activeQuery = isAllCategory ? allMoviesQuery : genreMoviesQuery;

  // Process and memoize movies data
  const movies = useMemo(() => {
    if (!activeQuery.data?.pages) return [];

    // The API has no status filter, so partition by the derived status here.
    const flatMovies = activeQuery.data.pages
      .flatMap(page => page.data)
      .filter(movie => movie.status === status);

    // Sort by rating for NOW_PLAYING, keep order for COMING_SOON
    if (status === MOVIE_STATUS.NOW_PLAYING) {
      return flatMovies
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
    }

    return flatMovies.slice(0, 10);
  }, [activeQuery.data, status]);

  return {
    movies,
    isLoading: activeQuery.isLoading,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    hasNextPage: activeQuery.hasNextPage,
    fetchNextPage: activeQuery.fetchNextPage,
    refetch: activeQuery.refetch,
    isRefetching: activeQuery.isRefetching,
  };
};

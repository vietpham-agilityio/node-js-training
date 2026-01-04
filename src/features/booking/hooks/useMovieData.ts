import { useMemo } from 'react';
import { GenreMovie, MovieStatus } from '../types/movie';
import { useMoviesByGenreInfinite, useMoviesInfinite } from './useMovies';

interface UseMovieDataParams {
  status: MovieStatus;
  genre?: string;
  enabled?: boolean;
}

export const useMovieData = ({
  status,
  genre,
  enabled = true,
}: UseMovieDataParams) => {
  const isAllCategory = !genre;

  // Fetch all movies
  const allMoviesQuery = useMoviesInfinite({
    status,
    enabled: enabled && isAllCategory,
  });

  // Fetch movies by genre
  const genreMoviesQuery = useMoviesByGenreInfinite({
    genre: genre as GenreMovie,
    status,
    enabled: enabled && !isAllCategory,
  });

  // Select active query based on category
  const activeQuery = isAllCategory ? allMoviesQuery : genreMoviesQuery;

  // Process and memoize movies data
  const movies = useMemo(() => {
    if (!activeQuery.data?.pages) return [];

    const flatMovies = activeQuery.data.pages.flat();

    // Sort by rating for NOW_PLAYING, keep order for COMING_SOON
    if (status === MovieStatus.NOW_PLAYING) {
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

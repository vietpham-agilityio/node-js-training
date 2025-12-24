import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

// Constants
import {
  ERROR_MESSAGES,
  MESSAGES,
  RATING_FILTERS,
  ROUTES,
  Size,
} from '@/constants';

// Hooks
import {
  useMoviesInfinite,
  useSearchMovies,
} from '@/features/booking/hooks/useMovies';
import { useDebounce } from '@/hooks/useDebounce';

// Types
import { Movie } from '@/features/booking/types/movie';

// Components
import { Button } from '@/components/Button';
import { MovieCard } from '@/components/MovieCard';
import { SearchInput } from '@/components/SearchInput';
import { Tabs } from '@/components/Tabs';
import { Typo } from '@/components/Typo';

// Icons
import { CancelIcon } from '@/icons/CancelIcon';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const SearchScreen = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch movies with infinite scroll
  const {
    data: allMoviesData,
    isLoading: isLoadingAllMovies,
    isFetchingNextPage: isFetchingNextAllMovies,
    hasNextPage: hasNextAllMovies,
    fetchNextPage: fetchNextAllMovies,
    refetch: refetchAllMovies,
    isRefetching: isRefetchingAllMovies,
    isError: isAllMoviesError,
    error: allMoviesError,
  } = useMoviesInfinite({
    enabled: !debouncedQuery, // Only fetch when not searching
  });

  // Search movies when query is provided
  const {
    data: searchResults,
    isLoading: isSearching,
    isFetching: isSearchFetching,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchMovies(debouncedQuery);

  // Determine which data to use
  const isSearchActive = debouncedQuery;

  // Flatten paginated data for all movies
  const allMovies = useMemo(() => {
    if (!allMoviesData?.pages) return [];
    return allMoviesData.pages.flat();
  }, [allMoviesData]);

  // IMPROVEMENT: Apply rating filter to both search results and all movies
  const displayedMovies = useMemo(() => {
    const movies = isSearchActive ? searchResults || [] : allMovies;
    const minRating =
      RATING_FILTERS.find(f => f.id === selectedRating)?.minRating || 0;

    if (minRating === 0) return movies;

    return movies.filter((movie: Movie) => (movie.rating || 0) >= minRating);
  }, [isSearchActive, searchResults, allMovies, selectedRating]);

  const isLoading = isSearchActive ? isSearching : isLoadingAllMovies;
  const isFetching = isSearchActive
    ? isSearchFetching
    : isFetchingNextAllMovies;
  const isError = isSearchActive ? isSearchError : isAllMoviesError;
  const error = isSearchActive ? searchError : allMoviesError;
  const hasNextPage = !isSearchActive && hasNextAllMovies;

  const handleMoviePress = useCallback(
    (movieId: string) => {
      router.push(ROUTES.MOVIE_DETAILS(movieId));
    },
    [router],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isSearchActive && hasNextPage && !isFetchingNextAllMovies) {
      fetchNextAllMovies();
    }
  }, [
    isSearchActive,
    hasNextPage,
    isFetchingNextAllMovies,
    fetchNextAllMovies,
  ]);

  const handleRetry = useCallback(() => {
    if (isSearchActive) {
      refetchSearch();
    } else {
      refetchAllMovies();
    }
  }, [isSearchActive, refetchSearch, refetchAllMovies]);

  const renderMovie = useCallback(
    ({ item }: { item: Movie }) => (
      <MovieCard
        {...item}
        onPress={() => handleMoviePress(item.id)}
        className="mb-4"
      />
    ),
    [handleMoviePress],
  );

  const keyExtractor = useCallback((item: Movie) => item.id, []);

  const getItemType = useCallback((item: Movie) => {
    return item.status || 'default';
  }, []);

  const resultsCountContent = useMemo(
    () =>
      isSearchActive
        ? `Found ${displayedMovies.length} movie${displayedMovies.length !== 1 ? 's' : ''} for "${debouncedQuery}"`
        : `Showing ${displayedMovies.length} movie${displayedMovies.length !== 1 ? 's' : ''}`,

    [debouncedQuery, displayedMovies.length, isSearchActive],
  );
  const ratingFilterContent = useMemo(
    () =>
      selectedRating !== 'all'
        ? ` with ${RATING_FILTERS.find(f => f.id === selectedRating)?.label}`
        : null,
    [selectedRating],
  );

  const Footer = useCallback(() => {
    if (!isFetching || isSearchActive) return null;

    return (
      <View
        className="py-4 items-center"
        accessibilityRole="progressbar"
        accessibilityLabel="Loading more movies"
      >
        <ActivityIndicator size="small" />
        <Typo size="xs" className="text-text-secondary mt-2">
          Loading more movies...
        </Typo>
      </View>
    );
  }, [isFetching, isSearchActive]);

  const Empty = useCallback(() => {
    if (isLoading) {
      return (
        <View
          className="flex-1 items-center justify-center py-16"
          accessibilityRole="progressbar"
        >
          <ActivityIndicator size="large" />
          <Typo size="sm" className="text-text-secondary mt-4">
            {isSearchActive ? 'Searching movies...' : 'Loading movies...'}
          </Typo>
        </View>
      );
    }

    if (isError) {
      return (
        <View
          className="flex-1 items-center justify-center py-16 px-6 gap-3"
          accessibilityRole="alert"
        >
          <Typo
            size="base"
            className="text-text-error text-center"
            weight="semibold"
          >
            {isSearchActive
              ? MESSAGES.NO_RESULT_FOUND
              : ERROR_MESSAGES.MOVIE_NETWORK_ERROR}
          </Typo>
          <Typo size="sm" className="text-center">
            {error?.message || 'Please try again'}
          </Typo>
          <Button
            size={Size.EXTRA_SMALL}
            title="Retry"
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel={
              isSearchActive ? 'Retry search' : 'Retry loading'
            }
          />
        </View>
      );
    }

    if (isSearchActive) {
      return (
        <View
          className="flex-1 items-center justify-center py-16 px-6"
          accessibilityRole="text"
        >
          <Typo
            size="lg"
            className="text-text-secondary text-center"
            weight="semibold"
          >
            Search for movies
          </Typo>
          <Typo size="sm" className="text-center mt-2">
            Enter characters to start searching
          </Typo>
        </View>
      );
    }

    if (isSearchActive && displayedMovies.length === 0) {
      return (
        <View
          className="flex-1 items-center justify-center py-16 px-6"
          accessibilityRole="text"
        >
          <Typo
            size="lg"
            className="text-text-secondary text-center"
            weight="semibold"
          >
            No movies found
          </Typo>
          <Typo size="sm" className="text-center mt-2">
            Try searching with different keywords for &quot;{debouncedQuery}
            &quot;
          </Typo>
        </View>
      );
    }

    return null;
  }, [
    isLoading,
    isError,
    error,
    isSearchActive,
    debouncedQuery,
    displayedMovies.length,
    handleRetry,
  ]);

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      accessibilityLabel="Search movies screen"
      accessibilityHint="Search screen"
      className="flex-1 bg-bg-primary"
    >
      <View className="px-6">
        <View className="mb-6">
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search movies..."
                returnKeyType="search"
                accessibilityLabel="Search movies input"
                accessibilityHint="Enter movie title to search, or leave empty to browse all"
                className="border-0"
              />
            </View>

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                className="w-11.5 h-11.5 items-center justify-center rounded-lg bg-linear-to-r from-secondary to-primary"
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                accessibilityHint="Clears the search input and shows all movies"
              >
                <CancelIcon />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* NEW: Rating Filter */}
        <View className="mb-4">
          <Typo size="sm" weight="medium" className="mb-2">
            Filter by Rating
          </Typo>
          <Tabs
            tabs={RATING_FILTERS}
            activeTab={selectedRating}
            onTabChange={setSelectedRating}
          />
        </View>

        {/* Results Count */}
        {displayedMovies.length > 0 && !isLoading && (
          <View className="py-2 mb-2 bg-success/10 rounded-lg">
            <Typo size="sm" accessibilityRole="text">
              {resultsCountContent}
              {ratingFilterContent}
            </Typo>
          </View>
        )}
      </View>

      <FlashList
        data={displayedMovies}
        renderItem={renderMovie}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        contentContainerStyle={{ paddingHorizontal: 24, marginBottom: 24 }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={Footer}
        ListEmptyComponent={Empty}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          !isSearchActive ? (
            <RefreshControl
              refreshing={isRefetchingAllMovies}
              onRefresh={refetchAllMovies}
              accessibilityLabel="Pull to refresh movies"
            />
          ) : undefined
        }
        accessibilityLabel={`${isSearchActive ? 'Search results' : 'All movies'} showing ${displayedMovies.length} movies`}
      />
    </StyledSafeAreaView>
  );
};

export default SearchScreen;

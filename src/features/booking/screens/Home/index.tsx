import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { FILTER_GENRE_TABS, ROUTES, TABS_FOOTER_HEIGHT } from '@/constants';

// Components
import { SearchInput } from '@/components/SearchInput';
import { Tabs } from '@/components/Tabs';
import { Typo } from '@/components/Typo';
import { MovieBannerCarousel } from '@/features/booking/components/MovieBannerCarousel';
import { PromotionCard } from '@/features/booking/components/PromotionCard';

// Hooks
import {
  useMoviesByGenreInfinite,
  useMoviesInfinite,
} from '@/features/booking/hooks/useMovies';

// Types
import { GenreMovie, MovieStatus } from '@/features/booking/types/movie';

// Mock
import { MOCK_PROMOTIONS } from '@/mocks';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const HomeScreen = () => {
  const [activeGenre, setActiveGenre] = useState<string>(
    FILTER_GENRE_TABS[0].id,
  );

  const isAllCategory = activeGenre === FILTER_GENRE_TABS[0].id;

  // Fetch all movies when "All" is selected
  const {
    data: allNowPlayingData,
    isLoading: isLoadingAllNowPlaying,
    isFetchingNextPage: isFetchingNextAllNowPlaying,
    hasNextPage: hasNextAllNowPlaying,
    fetchNextPage: fetchNextAllNowPlaying,
    refetch: refetchAllNowPlaying,
    isRefetching: isRefetchingAllNowPlaying,
  } = useMoviesInfinite({
    status: MovieStatus.NOW_PLAYING,
    enabled: isAllCategory,
  });

  const {
    data: allComingSoonData,
    isLoading: isLoadingAllComingSoon,
    isFetchingNextPage: isFetchingNextAllComingSoon,
    hasNextPage: hasNextAllComingSoon,
    fetchNextPage: fetchNextAllComingSoon,
    refetch: refetchAllComingSoon,
    isRefetching: isRefetchingAllComingSoon,
  } = useMoviesInfinite({
    status: MovieStatus.COMING_SOON,
    enabled: isAllCategory,
  });

  // Fetch movies by genre when specific genre is selected
  const {
    data: genreNowPlayingData,
    isLoading: isLoadingGenreNowPlaying,
    isFetchingNextPage: isFetchingNextGenreNowPlaying,
    hasNextPage: hasNextGenreNowPlaying,
    fetchNextPage: fetchNextGenreNowPlaying,
    refetch: refetchGenreNowPlaying,
    isRefetching: isRefetchingGenreNowPlaying,
  } = useMoviesByGenreInfinite({
    genre: activeGenre as GenreMovie,
    status: MovieStatus.NOW_PLAYING,
    enabled: !isAllCategory,
  });

  const {
    data: genreComingSoonData,
    isLoading: isLoadingGenreComingSoon,
    isFetchingNextPage: isFetchingNextGenreComingSoon,
    hasNextPage: hasNextGenreComingSoon,
    fetchNextPage: fetchNextGenreComingSoon,
    refetch: refetchGenreComingSoon,
    isRefetching: isRefetchingGenreComingSoon,
  } = useMoviesByGenreInfinite({
    genre: activeGenre as GenreMovie,
    status: MovieStatus.COMING_SOON,
    enabled: !isAllCategory,
  });

  // Select the appropriate data based on active category
  const nowPlayingData = isAllCategory
    ? allNowPlayingData
    : genreNowPlayingData;
  const comingSoonData = isAllCategory
    ? allComingSoonData
    : genreComingSoonData;

  const isLoadingNowPlaying = isAllCategory
    ? isLoadingAllNowPlaying
    : isLoadingGenreNowPlaying;
  const isLoadingComingSoon = isAllCategory
    ? isLoadingAllComingSoon
    : isLoadingGenreComingSoon;

  const isFetchingNextNowPlaying = isAllCategory
    ? isFetchingNextAllNowPlaying
    : isFetchingNextGenreNowPlaying;
  const isFetchingNextComingSoon = isAllCategory
    ? isFetchingNextAllComingSoon
    : isFetchingNextGenreComingSoon;

  const hasNextNowPlaying = isAllCategory
    ? hasNextAllNowPlaying
    : hasNextGenreNowPlaying;
  const hasNextComingSoon = isAllCategory
    ? hasNextAllComingSoon
    : hasNextGenreComingSoon;

  const fetchNextNowPlaying = isAllCategory
    ? fetchNextAllNowPlaying
    : fetchNextGenreNowPlaying;
  const fetchNextComingSoon = isAllCategory
    ? fetchNextAllComingSoon
    : fetchNextGenreComingSoon;

  const refetchNowPlaying = isAllCategory
    ? refetchAllNowPlaying
    : refetchGenreNowPlaying;
  const refetchComingSoon = isAllCategory
    ? refetchAllComingSoon
    : refetchGenreComingSoon;

  const isRefetchingNowPlaying = isAllCategory
    ? isRefetchingAllNowPlaying
    : isRefetchingGenreNowPlaying;
  const isRefetchingComingSoon = isAllCategory
    ? isRefetchingAllComingSoon
    : isRefetchingGenreComingSoon;

  // Flatten paginated data and take top 10 sorted by rating
  const nowPlayingMovies = useMemo(() => {
    if (!nowPlayingData?.pages) return [];
    return nowPlayingData.pages
      .flat()
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
  }, [nowPlayingData]);

  const comingSoonMovies = useMemo(() => {
    if (!comingSoonData?.pages) return [];
    return comingSoonData.pages.flat().slice(0, 10);
  }, [comingSoonData]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchNowPlaying(), refetchComingSoon()]);
  }, [refetchNowPlaying, refetchComingSoon]);

  const handleSearchPress = useCallback(() => {
    router.push(ROUTES.SEARCH);
  }, []);

  const renderNowPlaying = useCallback(
    () => (
      <View className="gap-2">
        <View className="px-6 flex-row items-center justify-between">
          <Typo size="xl" weight="semibold" accessibilityRole="header">
            Now Playing
          </Typo>
        </View>

        {isLoadingNowPlaying ||
        isRefetchingNowPlaying ||
        isFetchingNextNowPlaying ? (
          <View className="px-6 h-[220px] justify-center items-center">
            <ActivityIndicator size="large" />
            <Typo className="text-text-secondary mt-2">Loading movies...</Typo>
          </View>
        ) : nowPlayingMovies.length > 0 ? (
          <MovieBannerCarousel
            movies={nowPlayingMovies}
            onReachEnd={fetchNextNowPlaying}
            hasNextPage={hasNextNowPlaying}
            isFetchingNextPage={isFetchingNextNowPlaying}
          />
        ) : (
          <View className="px-6 h-[200px] justify-center">
            <Typo className="text-text-secondary text-center">
              No movies available in this category
            </Typo>
          </View>
        )}
      </View>
    ),
    [
      fetchNextNowPlaying,
      hasNextNowPlaying,
      isFetchingNextNowPlaying,
      isLoadingNowPlaying,
      isRefetchingNowPlaying,
      nowPlayingMovies,
    ],
  );

  const renderCommingSoon = useCallback(
    () => (
      <View className="gap-7">
        <View className="px-6 flex-row items-center justify-between">
          <Typo size="xl" weight="semibold" accessibilityRole="header">
            Coming Soon
          </Typo>
        </View>

        {isLoadingComingSoon ||
        isRefetchingComingSoon ||
        isFetchingNextComingSoon ? (
          <View className="px-6 h-[147px] justify-center items-center">
            <ActivityIndicator size="large" />
            <Typo className="text-text-secondary mt-2">Loading movies...</Typo>
          </View>
        ) : comingSoonMovies.length > 0 ? (
          <MovieBannerCarousel
            movies={comingSoonMovies}
            variant="vertical"
            onReachEnd={fetchNextComingSoon}
            hasNextPage={hasNextComingSoon}
            isFetchingNextPage={isFetchingNextComingSoon}
          />
        ) : (
          <View className="px-6 h-[150px] justify-center">
            <Typo className="text-text-secondary text-center">
              No upcoming movies in this category
            </Typo>
          </View>
        )}
      </View>
    ),
    [
      comingSoonMovies,
      fetchNextComingSoon,
      hasNextComingSoon,
      isFetchingNextComingSoon,
      isLoadingComingSoon,
      isRefetchingComingSoon,
    ],
  );

  const ListHeader = useCallback(
    () => (
      <View className="pt-3">
        {renderNowPlaying()}
        {renderCommingSoon()}
      </View>
    ),
    [renderNowPlaying, renderCommingSoon],
  );

  const ListFooter = useCallback(
    () => (
      <View className="px-6">
        <View className="gap-4 mt-7 mb-6">
          <View className="flex-row justify-between items-center">
            <Typo size="xl" weight="semibold" accessibilityRole="header">
              Promotions
            </Typo>
            <Link href={ROUTES.HOME} asChild>
              <Typo
                size="sm"
                weight="medium"
                className="text-text-currency"
                accessibilityRole="link"
                accessibilityLabel="See all promotions"
              >
                View all
              </Typo>
            </Link>
          </View>
        </View>
        <View className="gap-4">
          {MOCK_PROMOTIONS.map(promotion => (
            <PromotionCard key={promotion.id} {...promotion} />
          ))}
        </View>
      </View>
    ),
    [],
  );

  return (
    <StyledSafeAreaView
      edges={[]}
      accessibilityLabel="Home screen"
      accessibilityHint="Home screen"
      className="h-full bg-bg-primary"
    >
      {/* Search Input */}
      <View className="px-6 mb-7">
        <SearchInput
          className="border-0"
          editable={false}
          accessibilityRole="button"
          accessibilityLabel="Search movies"
          onPress={handleSearchPress}
        />
      </View>

      {/* Category Tabs */}
      <View className="pl-6 mb-3">
        <Tabs
          tabs={FILTER_GENRE_TABS}
          activeTab={activeGenre}
          onTabChange={setActiveGenre}
        />
      </View>

      <FlashList
        data={MOCK_PROMOTIONS}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingBottom: TABS_FOOTER_HEIGHT,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingNowPlaying || isRefetchingComingSoon}
            onRefresh={handleRefresh}
            accessibilityLabel="Pull to refresh movies"
          />
        }
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
      />
    </StyledSafeAreaView>
  );
};

export default HomeScreen;

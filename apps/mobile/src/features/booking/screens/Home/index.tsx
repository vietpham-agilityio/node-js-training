import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { ROUTES, TABS_FOOTER_HEIGHT } from '@/constants';

// Components
import { SearchInput } from '@/components/SearchInput';
import { Tabs } from '@/components/Tabs';
import { Typo } from '@/components/Typo';
import { ComingSoonSection } from '@/features/booking/components/ComingSoonSection';
import { NowPlayingSection } from '@/features/booking/components/NowPlayingSection';
import { PromotionCard } from '@/features/booking/components/PromotionCard';

// Hooks
import { useGenres } from '@/features/booking/hooks/useGenres';
import { useMovieData } from '@/features/booking/hooks/useMovieData';

// Types
import { MovieStatus } from '@/features/booking/schemas/movie';
import { MOVIE_STATUS } from '@/constants/status';

// Mock
import { MOCK_PROMOTIONS } from '@/mocks';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const ALL_GENRE_ID = 'all';

const HomeScreen = () => {
  const [activeGenre, setActiveGenre] = useState<string>(ALL_GENRE_ID);

  const { data: genres = [] } = useGenres();

  const genreTabs = useMemo(
    () => [
      { id: ALL_GENRE_ID, label: 'All' },
      ...genres.map(genre => ({ id: genre.id, label: genre.name })),
    ],
    [genres],
  );

  const currentGenre = activeGenre === ALL_GENRE_ID ? undefined : activeGenre;

  // Simplified data fetching with custom hook
  const nowPlaying = useMovieData({
    status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
    genreId: currentGenre,
  });

  const comingSoon = useMovieData({
    status: MOVIE_STATUS.COMING_SOON as MovieStatus,
    genreId: currentGenre,
  });

  // Handlers
  const handleRefresh = useCallback(async () => {
    await Promise.all([nowPlaying.refetch(), comingSoon.refetch()]);
  }, [nowPlaying, comingSoon]);

  const handleSearchPress = useCallback(() => {
    router.push(ROUTES.SEARCH);
  }, []);

  const handleFetchNextNowPlaying = useCallback(() => {
    if (nowPlaying.hasNextPage && !nowPlaying.isFetchingNextPage) {
      nowPlaying.fetchNextPage();
    }
  }, [nowPlaying]);

  const handleFetchNextComingSoon = useCallback(() => {
    if (comingSoon.hasNextPage && !comingSoon.isFetchingNextPage) {
      comingSoon.fetchNextPage();
    }
  }, [comingSoon]);

  // Memoized section props
  const nowPlayingProps = useMemo(
    () => ({
      movies: nowPlaying.movies,
      isLoading: nowPlaying.isLoading,
      isRefetching: nowPlaying.isRefetching,
      isFetchingNext: nowPlaying.isFetchingNextPage,
      onReachEnd: handleFetchNextNowPlaying,
      hasNextPage: nowPlaying.hasNextPage,
    }),
    [
      nowPlaying.movies,
      nowPlaying.isLoading,
      nowPlaying.isRefetching,
      nowPlaying.isFetchingNextPage,
      nowPlaying.hasNextPage,
      handleFetchNextNowPlaying,
    ],
  );

  const comingSoonProps = useMemo(
    () => ({
      movies: comingSoon.movies,
      isLoading: comingSoon.isLoading,
      isRefetching: comingSoon.isRefetching,
      isFetchingNext: comingSoon.isFetchingNextPage,
      onReachEnd: handleFetchNextComingSoon,
      hasNextPage: comingSoon.hasNextPage,
    }),
    [
      comingSoon.movies,
      comingSoon.isLoading,
      comingSoon.isRefetching,
      comingSoon.isFetchingNextPage,
      comingSoon.hasNextPage,
      handleFetchNextComingSoon,
    ],
  );

  // Memoized list components
  const ListHeader = useMemo(
    () => (
      <View className="pt-3">
        <NowPlayingSection {...nowPlayingProps} />
        <ComingSoonSection {...comingSoonProps} />
      </View>
    ),
    [nowPlayingProps, comingSoonProps],
  );

  const ListFooter = useMemo(
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
          accessibilityHint="Search for movies"
          onPress={handleSearchPress}
        />
      </View>

      {/* Category Tabs */}
      <View className="pl-6 mb-3">
        <Tabs
          tabs={genreTabs}
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
            refreshing={nowPlaying.isRefetching || comingSoon.isRefetching}
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

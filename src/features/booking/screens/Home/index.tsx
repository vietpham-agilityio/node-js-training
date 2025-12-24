import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import {
  FILTER_CATEGORY_TABS,
  ROUTES,
  Size,
  TABS_FOOTER_HEIGHT,
} from '@/constants';

// Components
import { Button } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import { Tabs } from '@/components/Tabs';
import { Typo } from '@/components/Typo';
import { MovieBannerCarousel } from '@/features/booking/components/MovieBannerCarousel';
import { PromotionCard } from '@/features/booking/components/PromotionCard';

// Hooks
import { useMoviesInfinite } from '@/features/booking/hooks/useMovies';

// Types

import { MovieStatus } from '@/features/booking/types/movie';

// Mock
import { MOCK_PROMOTIONS } from '@/mocks';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState<string>(
    FILTER_CATEGORY_TABS[0].id,
  );

  // Fetch movies with infinite scroll
  const {
    data: nowPlayingData,
    isLoading: isLoadingNowPlaying,
    isFetchingNextPage: isFetchingNextNowPlaying,
    hasNextPage: hasNextNowPlaying,
    fetchNextPage: fetchNextNowPlaying,
    refetch: refetchNowPlaying,
    isRefetching: isRefetchingNowPlaying,
  } = useMoviesInfinite({
    status: MovieStatus.NOW_PLAYING,
  });

  const {
    data: comingSoonData,
    isLoading: isLoadingComingSoon,
    isFetchingNextPage: isFetchingNextComingSoon,
    hasNextPage: hasNextComingSoon,
    fetchNextPage: fetchNextComingSoon,
    refetch: refetchComingSoon,
    isRefetching: isRefetchingComingSoon,
  } = useMoviesInfinite({
    status: MovieStatus.COMING_SOON,
  });

  // Flatten paginated data
  const nowPlayingMovies = useMemo(() => {
    if (!nowPlayingData?.pages) return [];
    return nowPlayingData.pages.flat();
  }, [nowPlayingData]);

  const comingSoonMovies = useMemo(() => {
    if (!comingSoonData?.pages) return [];
    return comingSoonData.pages.flat();
  }, [comingSoonData]);

  // Filter by category and sort by rating
  const filteredNowPlayingMovies = useMemo(() => {
    if (!nowPlayingMovies.length) return [];

    let filtered = nowPlayingMovies;

    // Filter by genre if not 'All'
    if (activeCategory !== FILTER_CATEGORY_TABS[0].id) {
      filtered = nowPlayingMovies.filter(movie =>
        movie.genre?.some(
          (g: string) => g.toLowerCase() === activeCategory.toLowerCase(),
        ),
      );
    }

    // Sort by rating and take top 10
    return filtered
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
  }, [nowPlayingMovies, activeCategory]);

  const filteredComingSoonMovies = useMemo(() => {
    if (!comingSoonMovies.length) return [];

    let filtered = comingSoonMovies;

    if (activeCategory !== FILTER_CATEGORY_TABS[0].id) {
      filtered = comingSoonMovies.filter(movie =>
        movie.genre?.some(
          (g: string) => g.toLowerCase() === activeCategory.toLowerCase(),
        ),
      );
    }

    return filtered.slice(0, 10);
  }, [comingSoonMovies, activeCategory]);

  const isRefreshing = isRefetchingNowPlaying || isRefetchingComingSoon;
  const isLoading = isLoadingNowPlaying || isLoadingComingSoon;

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchNowPlaying(), refetchComingSoon()]);
  }, [refetchNowPlaying, refetchComingSoon]);

  const handleSearchPress = useCallback(() => {
    router.push(ROUTES.SEARCH);
  }, []);

  const ListHeader = useCallback(
    () => (
      <View className="pt-3">
        <View className="gap-2">
          <View className="px-6 flex-row items-center justify-between">
            <Typo size="xl" weight="semibold" accessibilityRole="header">
              Now Playing
            </Typo>
            {isFetchingNextNowPlaying && <ActivityIndicator size="small" />}
          </View>

          {filteredNowPlayingMovies.length > 0 ? (
            <MovieBannerCarousel movies={filteredNowPlayingMovies} />
          ) : (
            <View className="px-6 py-8 gap-2">
              <Typo className="text-text-secondary text-center">
                No movies available in this category
              </Typo>
              {hasNextNowPlaying && (
                <Button
                  size={Size.EXTRA_SMALL}
                  title="Load more movies"
                  onPress={() => fetchNextNowPlaying()}
                  accessibilityRole="button"
                  accessibilityLabel="Load more movies"
                />
              )}
            </View>
          )}
        </View>

        <View className="gap-7">
          <View className="px-6 flex-row items-center justify-between">
            <Typo size="xl" weight="semibold" accessibilityRole="header">
              Coming Soon
            </Typo>
            {isFetchingNextComingSoon && <ActivityIndicator size="small" />}
          </View>

          {filteredComingSoonMovies.length > 0 ? (
            <MovieBannerCarousel
              movies={filteredComingSoonMovies}
              variant="vertical"
            />
          ) : (
            <View className="px-6 py-8 gap-2">
              <Typo className="text-text-secondary text-center">
                No upcoming movies in this category
              </Typo>
              {hasNextComingSoon && (
                <Button
                  size={Size.EXTRA_SMALL}
                  title="Load more movies"
                  onPress={() => fetchNextComingSoon()}
                  accessibilityRole="button"
                  accessibilityLabel="Load more movies"
                />
              )}
            </View>
          )}
        </View>
      </View>
    ),
    [
      filteredNowPlayingMovies,
      filteredComingSoonMovies,
      isFetchingNextNowPlaying,
      isFetchingNextComingSoon,
      hasNextNowPlaying,
      hasNextComingSoon,
      fetchNextNowPlaying,
      fetchNextComingSoon,
    ],
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

  if (isLoading) {
    return (
      <StyledSafeAreaView
        edges={[]}
        accessibilityLabel="Loading home screen"
        className="h-full bg-bg-primary items-center justify-center"
      >
        <ActivityIndicator size="large" />
        <Typo className="text-text-secondary mt-4">Loading movies...</Typo>
      </StyledSafeAreaView>
    );
  }

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
          tabs={FILTER_CATEGORY_TABS}
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
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
            refreshing={isRefreshing}
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

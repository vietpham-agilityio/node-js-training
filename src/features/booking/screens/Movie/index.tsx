import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Shopify
import { FlashList } from '@shopify/flash-list';

// Expo
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

// Unwind
import { withUniwind } from 'uniwind';

// Components
import { Button } from '@/components/Button';
import { HorizontalCard } from '@/components/HorizontalCard';
import { Tabs } from '@/components/Tabs';
import { Typo } from '@/components/Typo';
import { ExpandableText } from '@/features/booking/components/ExpandableText';
import { MovieTrailerCarousel } from '@/features/booking/components/MovieTrailerCarousel';
import { UserCard } from '@/features/booking/components/UserCard';

// Constants
import {
  BLUR_HASH,
  ContentType,
  DETAIL_MOVIE_TABS,
  ROUTES,
  Size,
  TABS_FOOTER_HEIGHT,
} from '@/constants';

// Hooks
import { useMovie } from '@/features/booking/hooks/useMovies';

// Stores
import { useBookingStore } from '@/features/booking/store/booking';
import { useMovieStore } from '@/stores/movie';

// Types

import { CastMember } from '@/features/booking/types/movie';

// Icons
import { ArrowRightIcon } from '@/icons/ArrowRightIcon';

type ContentItem =
  | {
      type: ContentType.SYNOPSIS;
      data: string;
    }
  | {
      type: ContentType.CAST_CREW;
      data: CastAndCrewItem[];
    }
  | {
      type: ContentType.TRAILER;
      data: string[];
    };

interface CastAndCrewItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

const StyledImage = withUniwind(Image);
const StyledSafeAreaView = withUniwind(SafeAreaView);

const IconWithUniWind = withUniwind(ArrowRightIcon);

const MovieScreen = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id || '';

  const setMovie = useBookingStore(state => state.setMovie);

  const [activeTab, setActiveTab] = useState<string>(DETAIL_MOVIE_TABS[0].id);

  const { data: movie, isLoading, refetch: refetchMovie } = useMovie(id);

  const setSelectedMovie = useMovieStore(state => state.setSelectedMovie);

  const {
    title = '',
    posterUrl = '',
    durationMinutes = 0,
    genre = [],
    rating,
    castCrew,
    synopsis = '',
    trailerUrl = [],
  } = movie || {};

  const castAndCrew: CastAndCrewItem[] = useMemo(
    () =>
      castCrew?.actors.map(({ name, imageUrl }: CastMember) => ({
        id: name,
        name: name,
        imageUrl: imageUrl,
      })) ?? [],
    [castCrew],
  );

  const contentItems = useMemo<ContentItem[]>(() => {
    if (activeTab === DETAIL_MOVIE_TABS[0].id) {
      const items: ContentItem[] = [
        { type: ContentType.SYNOPSIS, data: synopsis },
      ];

      if (castAndCrew?.length > 0) {
        items.push({ type: ContentType.CAST_CREW, data: castAndCrew });
      }

      if (trailerUrl?.length > 0) {
        items.push({ type: ContentType.TRAILER, data: trailerUrl });
      }

      return items;
    }
    return [];
  }, [activeTab, synopsis, castAndCrew, trailerUrl]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const handleNavigateToSelectCinema = useCallback(() => {
    setMovie(movie!);
    setSelectedMovie(movie!);
    router.push({
      pathname: ROUTES.CINEMA,
      params: {
        movieId: id,
      },
    });
  }, [id, movie, setSelectedMovie, setMovie]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ContentItem }) => {
      switch (item.type) {
        case ContentType.SYNOPSIS:
          return (
            <View className="px-6 mb-7">
              <Typo size="lg" weight="medium" className="mb-4">
                Synopsis
              </Typo>
              <ExpandableText text={synopsis} />
            </View>
          );
        case ContentType.CAST_CREW:
          return (
            <View className="mb-7">
              <Typo size="lg" weight="medium" className="mb-5 px-6">
                Cast & Crew
              </Typo>
              <FlashList
                data={item.data}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                }}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                renderItem={({
                  item: cast,
                }: {
                  item: {
                    id: string;
                    name: string;
                    imageUrl: string | null;
                  };
                }) => (
                  <UserCard
                    imageUrl={cast?.imageUrl ?? ''}
                    fullName={cast?.name ?? ''}
                  />
                )}
                keyExtractor={cast => cast?.id ?? ''}
              />
            </View>
          );
        case ContentType.TRAILER:
          return (
            <View className="mb-12">
              <Typo size="lg" weight="semibold" className="px-6 mb-5">
                Trailer and song
              </Typo>
              <MovieTrailerCarousel trailers={item.data} />
            </View>
          );
        default:
          return null;
      }
    },
    [synopsis],
  );

  if (isLoading) {
    // TODO: Will handle global loading
    return (
      <StyledSafeAreaView
        edges={['bottom']}
        accessibilityLabel="Loading home screen"
        className="h-full bg-bg-primary items-center justify-center"
      >
        <ActivityIndicator size="large" className="text-primary" />
        <Typo className="text-text-secondary mt-4">Movie Loading...</Typo>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      accessibilityLabel="Movie screen"
      accessibilityHint="Movie screen"
      className="h-full bg-dark-blue"
    >
      <>
        {/* Movie Banner */}
        <View
          className="relative w-full top-0 left-0 right-0"
          testID="movie-banner-container"
        >
          <View className="absolute top-10 left-0 right-0">
            <TouchableOpacity
              onPress={handleGoBack}
              accessibilityRole="button"
              accessibilityLabel="Go back to home"
              className="w-14 h-14 rounded-full z-2 rotate-180 items-center justify-center"
            >
              <IconWithUniWind className="text-white" />
            </TouchableOpacity>
          </View>
          <StyledImage
            contentFit="cover"
            transition={200}
            accessibilityLabel={title}
            accessibilityHint="Movie banner"
            accessibilityRole="image"
            className="w-full h-56"
            source={{
              uri: posterUrl,
            }}
            placeholder={{
              blurhash: BLUR_HASH,
            }}
          />
          <View className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-bg-quaternary to-bg-quaternary/0" />
        </View>
        {/* Horizontal Card */}
        <View className="px-6 -mt-20" testID="horizontal-card-container">
          <HorizontalCard
            title={title}
            posterUrl={posterUrl}
            durationMinutes={durationMinutes}
            genre={genre}
            rating={rating}
            imageSize={Size.MEDIUM}
          />
        </View>
        {/* Tabs */}
        <View className="px-6 mt-7.5 mb-7">
          <Tabs
            tabs={DETAIL_MOVIE_TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="secondary"
          />
        </View>
      </>
      <FlashList
        testID="vertical-flash-list"
        accessibilityLabel="Movie content list"
        accessibilityHint="Movie content list"
        data={contentItems}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        contentContainerStyle={{
          paddingBottom: TABS_FOOTER_HEIGHT,
        }}
        refreshControl={
          <RefreshControl
            testID="refresh-control"
            refreshing={isLoading}
            onRefresh={refetchMovie}
            accessibilityLabel="Pull to refresh movie"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Typo size="base" weight="medium">
              This feature will be available soon
            </Typo>
          </View>
        }
      />

      {/* Floating Button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-16.5 pt-4 bg-linear-to-t from-bg-quaternary via-bg-quaternary to-transparent">
        <Button
          onPress={handleNavigateToSelectCinema}
          title="Booking Movie"
          testID="booking-button"
          accessibilityLabel="Booking Movie"
          accessibilityHint="Navigate to select cinema screen"
        />
      </View>
    </StyledSafeAreaView>
  );
};

export default MovieScreen;

import { useCallback, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Expo
import { useLocalSearchParams } from 'expo-router';

// Expo
import { Image } from 'expo-image';

// Unwind
import { withUniwind } from 'uniwind';

// Components
import { Tabs, Typo, UserCard } from '@/components/common';
import { MovieCard, MovieTrailerCarousel } from '@/components/feature';

// Types
import { Movie } from '@/types';

// Constants
import { BLUR_HASH, DETAIL_MOVIE_TABS, Size } from '@/constants';

// Mocks
import { CAST_MOCK, MOVIES_MOCK } from '@/mocks';

const StyledImage = withUniwind(Image);
const SafeAreaStyles = withUniwind(SafeAreaView);

const MovieScreen = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id || '';

  const [activeTab, setActiveTab] = useState<string>(DETAIL_MOVIE_TABS[0].id);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState<boolean>(false);

  // In production, fetch movie by id
  const movie: Movie = useMemo(() => {
    return MOVIES_MOCK.find(m => m.id === id) as Movie;
  }, [id]);

  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === 'choose-seat') {
      // TODO: Navigate to seat selection screen
    }
    setActiveTab(tabId);
  }, []);

  const handleToggleSynopsis = useCallback(() => {
    setIsSynopsisExpanded(prev => !prev);
  }, []);

  // Truncate synopsis for "see more" feature
  const synopsisText = useMemo(() => {
    const maxLength = 150;
    if (isSynopsisExpanded || movie?.synopsis.length <= maxLength) {
      return movie?.synopsis;
    }
    return movie?.synopsis.substring(0, maxLength) + '...';
  }, [movie?.synopsis, isSynopsisExpanded]);

  const shouldShowReadMore = useMemo(() => {
    return movie?.synopsis.length > 150;
  }, [movie?.synopsis]);

  return (
    <SafeAreaStyles edges={['bottom']} className="flex-1 bg-dark-blue">
      {/* Background Banner Image */}
      <View
        className="relative w-full top-0 left-0 right-0"
        testID="movie-banner-container"
      >
        <StyledImage
          source={{
            uri: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a58a7719-0dcf-4e0b-b7bb-d2b725dbbb8e/deu7no3-75f2aea5-d668-4ddd-8d73-9203f8b3004f.png/v1/fill/w_1500,h_500,q_80,strp/spider_man_no_way_home_banner_hd_by_andrewvm_deu7no3-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NTAwIiwicGF0aCI6Ii9mL2E1OGE3NzE5LTBkY2YtNGUwYi1iN2JiLWQyYjcyNWRiYmI4ZS9kZXU3bm8zLTc1ZjJhZWE1LWQ2NjgtNGRkZC04ZDczLTkyMDNmOGIzMDA0Zi5wbmciLCJ3aWR0aCI6Ijw9MTUwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.GLJ4oWnOISFMjjY0QcoOv3W9xGZcegwXTIYxX0rhxuM',
          }}
          contentFit="cover"
          transition={200}
          placeholder={{
            blurhash: BLUR_HASH,
          }}
          accessibilityIgnoresInvertColors
          className="w-full h-56"
          testID="movie-banner-image"
        />
        <View className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-bg-quaternary to-bg-quaternary/0" />
      </View>

      {/* Movie Card Section - Overlapping the banner */}
      <View className="px-6 -mt-20" testID="movie-card-container">
        <MovieCard
          title={movie.title}
          posterUrl={movie.posterUrl}
          durationMinutes={movie.durationMinutes}
          genre={movie.genre}
          rating={movie.rating}
          imageSize={Size.MEDIUM}
        />
      </View>

      {/* Tabs Section */}
      <View className="px-6 mt-7.5 mb-7">
        <Tabs
          tabs={DETAIL_MOVIE_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          variant="secondary"
        />
      </View>

      <ScrollView
        contentContainerClassName="bg-dark-blue"
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Content */}
        {activeTab === DETAIL_MOVIE_TABS[0].id && (
          <>
            <View className="pl-6">
              {/* Synopsis Section */}
              <View className="mb-7">
                <Typo size="lg" weight="medium" className="mb-4">
                  Synopsis
                </Typo>
                <Typo size="sm" weight="regular" className="text-white/80">
                  {synopsisText}
                </Typo>
                {shouldShowReadMore && (
                  <TouchableOpacity
                    onPress={handleToggleSynopsis}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={
                      isSynopsisExpanded ? 'Read less' : 'Read more'
                    }
                  >
                    <Typo
                      size="sm"
                      weight="medium"
                      className="text-light-blue mt-2"
                    >
                      {isSynopsisExpanded ? 'Read less' : 'Read more'}
                    </Typo>
                  </TouchableOpacity>
                )}
              </View>

              {/* Cast & Crew Section */}
              <View>
                <Typo size="lg" weight="medium" className="mb-5">
                  Cast & Crew
                </Typo>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: 16,
                  }}
                >
                  {CAST_MOCK.map(({ id, name, imageUrl }) => (
                    <UserCard key={id} imageUrl={imageUrl} fullName={name} />
                  ))}
                </ScrollView>
              </View>
            </View>
            {/* Trailer and Song Section */}
            <View className="mb-12">
              <Typo size="lg" weight="semibold" className="ml-6 mb-5 mt-8">
                Trailer and song
              </Typo>
              {movie?.trailerUrl?.length > 0 && (
                <MovieTrailerCarousel trailers={movie.trailerUrl} />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaStyles>
  );
};

export default MovieScreen;

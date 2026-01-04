import { memo } from 'react';
import { View } from 'react-native';

// Types
import { Movie } from '@/features/booking/types/movie';

// Components
import { Typo } from '@/components/Typo';
import { MovieBannerCarousel } from '../MovieBannerCarousel';
import { MovieBannerCarouselSkeleton } from '../Skeletons/MovieBannerCarouselSkeleton';

interface NowPlayingSectionProps {
  isLoading?: boolean;
  isRefetching?: boolean;
  isFetchingNext?: boolean;
  hasNextPage?: boolean;
  onReachEnd?: () => void;
  movies: Movie[];
}

export const NowPlayingSection = memo(
  ({
    movies,
    isLoading,
    isRefetching,
    isFetchingNext,
    onReachEnd,
    hasNextPage,
  }: NowPlayingSectionProps) => (
    <View className="pt-3">
      <View className="gap-2">
        <View className="px-6 flex-row items-center justify-between">
          <Typo size="xl" weight="semibold" accessibilityRole="header">
            Now Playing
          </Typo>
        </View>

        {isLoading || isRefetching || isFetchingNext ? (
          <View className="my-4">
            <MovieBannerCarouselSkeleton variant="horizontal" count={3} />
          </View>
        ) : movies.length > 0 ? (
          <MovieBannerCarousel
            movies={movies}
            onReachEnd={onReachEnd}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNext}
          />
        ) : (
          <View className="px-6 py-8 gap-2">
            <Typo className="text-text-secondary text-center">
              No movies available in this category
            </Typo>
          </View>
        )}
      </View>
    </View>
  ),
);

NowPlayingSection.displayName = 'NowPlayingSection';

import { memo } from 'react';
import { View } from 'react-native';

// Types
import { Movie } from '@/features/booking/schemas/movie';

// Components
import { Typo } from '@/components/Typo';
import { MovieBannerCarousel } from '../MovieBannerCarousel';
import { MovieBannerCarouselSkeleton } from '../Skeletons/MovieBannerCarouselSkeleton';

interface ComingSoonSectionProps {
  movies: Movie[];
  isLoading?: boolean;
  isRefetching?: boolean;
  isFetchingNext?: boolean;
  onReachEnd?: () => void;
  hasNextPage?: boolean;
}

export const ComingSoonSection = memo(
  ({
    movies,
    isLoading,
    isRefetching,
    isFetchingNext,
    onReachEnd,
    hasNextPage,
  }: ComingSoonSectionProps) => (
    <View className="gap-7">
      <View className="px-6 flex-row items-center justify-between">
        <Typo size="xl" weight="semibold" accessibilityRole="header">
          Coming Soon
        </Typo>
      </View>

      {isLoading || isRefetching || isFetchingNext ? (
        <MovieBannerCarouselSkeleton variant="vertical" count={4} />
      ) : movies.length > 0 ? (
        <MovieBannerCarousel
          movies={movies}
          variant="vertical"
          onReachEnd={onReachEnd}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNext}
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
);

ComingSoonSection.displayName = 'ComingSoonSection';

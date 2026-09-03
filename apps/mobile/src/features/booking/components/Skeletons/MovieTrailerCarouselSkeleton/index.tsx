import { View } from 'react-native';

// Components
import { Skeleton } from '@/components/Skeleton';

interface MovieTrailerCarouselSkeletonProps {
  count?: number;
}

export const MovieTrailerCarouselSkeleton = ({
  count = 3,
}: MovieTrailerCarouselSkeletonProps) => {
  return (
    <View
      testID="movie-trailer-carousel-skeleton"
      accessibilityRole="none"
      accessibilityLabel="Loading trailers"
      className="mb-12"
    >
      {/* Section Title Skeleton */}
      <Skeleton
        width={180}
        height={24}
        borderRadius={4}
        className="px-6 mb-5"
        accessibilityLabel="Loading section title"
        testID="movie-trailer-skeleton-title"
      />

      {/* Trailer Cards Skeleton */}
      <View className="flex-row px-6 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton
            key={index}
            width={256}
            height={144}
            borderRadius={8}
            accessibilityLabel="Loading trailer"
            testID={`movie-trailer-skeleton-item-${index}`}
          />
        ))}
      </View>
    </View>
  );
};

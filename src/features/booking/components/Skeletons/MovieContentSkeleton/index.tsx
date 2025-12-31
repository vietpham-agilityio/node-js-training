import { View } from 'react-native';

// Components
import { Skeleton } from '@/components/Skeleton';

export const MovieContentSkeleton = () => (
  <View
    testID="movie-content-skeleton"
    accessibilityRole="none"
    accessibilityLabel="Loading movie content"
    className="px-6 mb-7"
  >
    {/* Section Title Skeleton */}
    <Skeleton
      width={120}
      height={24}
      borderRadius={4}
      className="mb-4"
      accessibilityLabel="Loading section title"
      testID="movie-content-skeleton-title"
    />

    {/* Content Lines Skeleton */}
    <View className="gap-2">
      <Skeleton
        width="100%"
        height={16}
        borderRadius={4}
        accessibilityLabel="Loading content line"
        testID="movie-content-skeleton-line-1"
      />
      <Skeleton
        width="100%"
        height={16}
        borderRadius={4}
        accessibilityLabel="Loading content line"
        testID="movie-content-skeleton-line-2"
      />
      <Skeleton
        width="90%"
        height={16}
        borderRadius={4}
        accessibilityLabel="Loading content line"
        testID="movie-content-skeleton-line-3"
      />
      <Skeleton
        width="95%"
        height={16}
        borderRadius={4}
        accessibilityLabel="Loading content line"
        testID="movie-content-skeleton-line-4"
      />
    </View>
  </View>
);

MovieContentSkeleton.displayName = 'MovieContentSkeleton';

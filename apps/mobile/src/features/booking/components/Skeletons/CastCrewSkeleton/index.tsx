import { View } from 'react-native';

// Components
import { Skeleton } from '@/components/Skeleton';

interface CastCrewSkeletonProps {
  count?: number;
}

export const CastCrewSkeleton = ({ count = 5 }: CastCrewSkeletonProps) => (
  <View
    testID="cast-crew-skeleton"
    accessibilityRole="none"
    accessibilityLabel="Loading cast and crew"
    className="mb-7"
  >
    {/* Section Title Skeleton */}
    <Skeleton
      width={140}
      height={24}
      borderRadius={4}
      className="mb-5 px-6"
      accessibilityLabel="Loading section title"
      testID="cast-crew-skeleton-title"
    />

    {/* Cast Cards Skeleton */}
    <View className="flex-row px-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="items-center gap-2"
          testID={`cast-crew-skeleton-item-${index}`}
        >
          {/* Avatar Skeleton */}
          <Skeleton
            width={72}
            height={72}
            borderRadius={8}
            accessibilityLabel="Loading cast member"
            testID={`cast-crew-skeleton-avatar-${index}`}
          />

          {/* Name Skeleton */}
          <Skeleton
            width={60}
            height={12}
            borderRadius={4}
            accessibilityLabel="Loading cast member name"
            testID={`cast-crew-skeleton-name-${index}`}
          />
        </View>
      ))}
    </View>
  </View>
);

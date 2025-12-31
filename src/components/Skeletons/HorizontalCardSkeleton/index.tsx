import { memo } from 'react';
import { View } from 'react-native';

// Components
import { Skeleton } from '@/components/Skeleton';

// Constants
import { Size } from '@/constants';

interface HorizontalCardSkeletonProps {
  imageSize?: Size;
  testID?: string;
}

const IMAGE_SIZE_MAP: Record<Size, { width: number; height: number }> = {
  [Size.SMALL]: { width: 84, height: 120 },
  [Size.MEDIUM]: { width: 120, height: 172 },
  [Size.LARGE]: { width: 160, height: 224 },
  [Size.EXTRA_SMALL]: { width: 84, height: 120 },
};

export const HorizontalCardSkeleton = memo(
  ({ imageSize = Size.MEDIUM, testID }: HorizontalCardSkeletonProps) => {
    const { width, height } = IMAGE_SIZE_MAP[imageSize];

    return (
      <View
        testID={testID || 'horizontal-card-skeleton'}
        className="w-full flex-row rounded-xl pr-4 gap-4"
        accessibilityRole="none"
        accessibilityLabel="Loading movie card"
      >
        {/* Left Section - Image Skeleton */}
        <Skeleton
          width={width}
          height={height}
          borderRadius={8}
          accessibilityLabel="Loading movie poster"
          testID="horizontal-card-skeleton-image"
        />

        {/* Right Section - Details Skeleton */}
        <View className="flex-1 justify-end gap-3">
          {/* Title Skeleton */}
          <Skeleton
            width="100%"
            height={20}
            borderRadius={4}
            accessibilityLabel="Loading movie title"
            testID="horizontal-card-skeleton-title"
          />

          {/* Rating/Genres Skeleton */}
          <View className="gap-1">
            <Skeleton
              width={80}
              height={12}
              borderRadius={4}
              accessibilityLabel="Loading rating"
              testID="horizontal-card-skeleton-rating"
            />
            <Skeleton
              width={120}
              height={12}
              borderRadius={4}
              accessibilityLabel="Loading genres"
              testID="horizontal-card-skeleton-genres"
            />
          </View>
        </View>
      </View>
    );
  },
);

HorizontalCardSkeleton.displayName = 'HorizontalCardSkeleton';

import { View } from 'react-native';

// Components
import { Divider } from '@/components/Divider';
import { HorizontalCardSkeleton } from '@/components/Skeletons/HorizontalCardSkeleton';
import { Skeleton } from '@/components/Skeleton';

// Constants
import { Size } from '@/constants';

export const TicketDetailSkeleton = () => (
  <View
    testID="ticket-detail-skeleton"
    className="bg-deep-blue px-4 py-6 rounded-xl gap-3.5"
    accessibilityRole="none"
    accessibilityLabel="Loading ticket details"
  >
    {/* Movie Details Section Skeleton */}
    <HorizontalCardSkeleton imageSize={Size.SMALL} />

    {/* Order Details Section Skeleton */}
    <View className="gap-4 pt-6.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          className="flex-row justify-between items-center"
          testID={`ticket-detail-skeleton-row-${index}`}
        >
          {/* Label Skeleton */}
          <Skeleton
            width={60}
            height={16}
            borderRadius={4}
            accessibilityLabel="Loading label"
            testID={`ticket-detail-skeleton-label-${index}`}
          />
          {/* Value Skeleton */}
          <Skeleton
            width={220}
            height={16}
            borderRadius={4}
            accessibilityLabel="Loading value"
            testID={`ticket-detail-skeleton-value-${index}`}
          />
        </View>
      ))}
    </View>

    <Divider className="border-dashed" />

    {/* QR Code Section Skeleton */}
    <View className="items-center justify-center gap-2">
      {/* QR Code Skeleton */}
      <Skeleton
        width={200}
        height={200}
        borderRadius={8}
        className="bg-white"
        accessibilityLabel="Loading QR code"
        testID="ticket-detail-skeleton-qr"
      />
      {/* ID Order Skeleton */}
      <View className="items-center gap-1">
        <Skeleton
          width={80}
          height={16}
          borderRadius={4}
          accessibilityLabel="Loading ID order label"
          testID="ticket-detail-skeleton-id-label"
        />
        <Skeleton
          width={150}
          height={16}
          borderRadius={4}
          accessibilityLabel="Loading ID order value"
          testID="ticket-detail-skeleton-id-value"
        />
      </View>
    </View>
  </View>
);

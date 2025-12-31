import { View } from 'react-native';

// Components
import { Skeleton } from '@/components/Skeleton';

// Constants
import { CARD_HEIGHT, CARD_WIDTH } from '../../WalletCard';

export const WalletCardSkeleton = () => (
  <View
    testID="wallet-card-skeleton"
    className="w-full justify-center items-center rounded-xl overflow-hidden shadow-lg"
    style={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    }}
    accessibilityRole="none"
    accessibilityLabel="Loading wallet card"
  >
    <Skeleton
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      borderRadius={12}
      accessibilityLabel="Loading wallet card"
      testID="wallet-card-skeleton-main"
    />
  </View>
);

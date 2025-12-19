import { memo } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Components
import { Typo } from '../Typo';

// Stores
import { useLoadingStore } from '@/stores/loading';

interface LoadingProps {
  message?: string;
}

export const Loading = memo(({ message }: LoadingProps) => {
  const { isLoading, message: storeMessage } = useLoadingStore();

  if (!isLoading) return null;

  const displayMessage = message || storeMessage;

  return (
    <View
      className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center bg-bg-dark/50 z-50"
      accessibilityRole="progressbar"
      accessibilityLabel={displayMessage || 'Loading...'}
    >
      <ActivityIndicator size="large" className="text-primary" />
      {displayMessage && (
        <Typo weight="medium" size="xs" className="text-primary mt-2">
          {displayMessage}
        </Typo>
      )}
    </View>
  );
});

Loading.displayName = 'Loading';

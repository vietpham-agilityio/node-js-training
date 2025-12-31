import { memo, useEffect } from 'react';
import { DimensionValue, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Utils
import { cn } from '@/utils/cn';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  className?: string;
  style?: ViewStyle;
  borderRadius?: number;
  accessibilityLabel?: string;
  testID?: string;
}

export const Skeleton = memo(
  ({
    width,
    height,
    className = '',
    style,
    borderRadius,
    accessibilityLabel = 'Loading',
    testID,
  }: SkeletonProps) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
      opacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true);
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const skeletonStyle: ViewStyle = {
      ...(width && { width }),
      ...(height && { height }),
      ...(borderRadius !== undefined && { borderRadius }),
      ...style,
    };

    return (
      <Animated.View
        testID={testID}
        style={[skeletonStyle, animatedStyle]}
        className={cn('bg-bg-secondary', className)}
        accessibilityRole="none"
        accessibilityLabel={accessibilityLabel}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

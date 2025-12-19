import { memo, useCallback, useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Constants
import { TOAST_DURATION } from '@/constants';

// Components
import { Typo } from '../Typo';

// Stores
import { useToastStore } from '@/stores/toast';

// Utils
import { cn } from '@/utils';

export const Toast = memo(() => {
  // Store
  const { toast, hide } = useToastStore();

  const insets = useSafeAreaInsets();

  // Animation value for vertical translation (translateY)
  // -100: Hidden above viewport (initial state)
  // 0: Visible at top of screen
  // -100: Hidden above viewport (dismissed state)
  const slideAnimation = useRef(new Animated.Value(-100)).current;

  const handleDismiss = useCallback(() => {
    // Animate toast sliding up and out of view
    Animated.timing(slideAnimation, {
      toValue: -100, // Move toast 100px above viewport
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      hide();
    });
  }, [slideAnimation, hide]);

  useEffect(() => {
    if (toast) {
      // Slide in animation: Spring animation for smooth entrance
      Animated.spring(slideAnimation, {
        toValue: 0, // Move toast to visible position at top of screen
        tension: 65, // Spring tension (higher = faster)
        friction: 11, // Spring friction (higher = less bouncy)
        useNativeDriver: true,
      }).start();

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, TOAST_DURATION);

      return () => {
        clearTimeout(timer);
      };
    } else {
      // Slide out animation when toast is cleared from store
      Animated.timing(slideAnimation, {
        toValue: -100, // Move toast back above viewport
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [toast, slideAnimation, handleDismiss]);

  if (!toast) {
    return null;
  }

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnimation }],
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel={`${toast.type} toast: ${toast.message}`}
      >
        <View
          className={cn(
            'px-4 py-2.5 w-full',
            toast.type === 'success' ? 'bg-green-600' : 'bg-bg-danger',
          )}
        >
          <Typo size="2xs" weight="regular" className="text-center">
            {toast.message}
          </Typo>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

Toast.displayName = 'Toast';

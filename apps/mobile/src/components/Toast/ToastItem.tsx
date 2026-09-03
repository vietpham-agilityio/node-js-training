import { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

// Components
import { Typo } from '../Typo';

// Stores
import { Toast as ToastType } from '@/stores/toast';

// Utils
import { cn } from '@/utils/cn';

interface ToastItemProps {
  toast: ToastType;
  onDismiss: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ToastItem = memo(({ toast, onDismiss, style }: ToastItemProps) => {
  const slideAnimation = useRef(new Animated.Value(-100)).current;

  const handleDismiss = useCallback(() => {
    // Animate toast sliding up and out of view
    Animated.timing(slideAnimation, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  }, [slideAnimation, onDismiss]);

  useEffect(() => {
    // Slide in animation: Spring animation for smooth entrance
    Animated.spring(slideAnimation, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();

    // Auto dismiss after duration
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [toast, slideAnimation, handleDismiss]);

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: slideAnimation }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel={`${toast.type} toast: ${toast.message}`}
      >
        <View
          className={cn(
            'px-4 py-2.5 w-full flex-row justify-center items-center',
            getBackgroundColor(),
          )}
        >
          {/* Message */}
          <View className="flex-1 justify-center items-center">
            <Typo
              size="2xs"
              weight="regular"
              className="text-white text-center"
            >
              {toast.message}
            </Typo>
          </View>

          {/* Action Button (optional) */}
          {toast.action && (
            <TouchableOpacity
              onPress={() => {
                toast.action?.onPress();
                handleDismiss();
              }}
              className="ml-2 px-2 py-1 bg-white/20 rounded"
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
            >
              <Typo size="2xs" weight="semibold" className="text-white">
                {toast.action.label}
              </Typo>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

ToastItem.displayName = 'ToastItem';

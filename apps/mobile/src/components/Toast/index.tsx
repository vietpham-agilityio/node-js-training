import { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Stores
import { useToastStore } from '@/stores/toast';

// Components
import { ToastItem } from './ToastItem';

export const Toast = memo(() => {
  const { toasts, hide } = useToastStore();
  const insets = useSafeAreaInsets();

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'box-none',
      }}
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => hide(toast.id)}
          style={{ marginBottom: index < toasts.length - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
});

Toast.displayName = 'Toast';

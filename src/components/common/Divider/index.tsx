import { memo } from 'react';
import { View } from 'react-native';

interface DividerProps {
  className?: string;
}
export const Divider = memo(({ className }: DividerProps) => (
  <View className={`h-px bg-grey ${className || ''}`} testID="divider" />
));

Divider.displayName = 'Divider';

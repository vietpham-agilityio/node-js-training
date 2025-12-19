import { memo } from 'react';
import { View } from 'react-native';

// Utils
import { cn } from '@/utils';

interface DividerProps {
  className?: string;
}
export const Divider = memo(({ className }: DividerProps) => (
  <View
    className={cn('h-0.5 border-b border-grey', className)}
    testID="divider"
  />
));

Divider.displayName = 'Divider';

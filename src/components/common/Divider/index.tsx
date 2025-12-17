import { cn } from '@/utils';
import { memo } from 'react';
import { View } from 'react-native';

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

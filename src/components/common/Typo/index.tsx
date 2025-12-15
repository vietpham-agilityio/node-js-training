import { memo } from 'react';
import { Text } from 'react-native';

// Utils
import { cn } from '@/utils';

export type FontSize =
  | '4xs'
  | '3xs'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl';

export type FontWeight = 'light' | 'regular' | 'medium' | 'semibold';

export interface TypoProps {
  children: React.ReactNode;
  size?: FontSize;
  weight?: FontWeight;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  '4xs': 'text-4xs',
  '3xs': 'text-3xs',
  '2xs': 'text-2xs',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

const FONT_WEIGHT_MAP: Record<FontWeight, string> = {
  light: 'font-montserrat-light',
  regular: 'font-montserrat-regular',
  medium: 'font-montserrat-medium',
  semibold: 'font-montserrat-semibold',
};

export const Typo = memo(
  ({
    children,
    size = 'base',
    weight = 'regular',
    className = '',
    testID,
  }: TypoProps) => (
    <Text
      accessibilityRole="text"
      className={cn(
        'text-white',
        FONT_SIZE_MAP[size],
        FONT_WEIGHT_MAP[weight],
        className,
      )}
      testID={testID}
    >
      {children}
    </Text>
  ),
);

Typo.displayName = 'Typo';

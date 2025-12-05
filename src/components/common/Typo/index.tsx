import { Text } from 'react-native';

type FontSize = '3xs' | '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

type FontWeight = 'light' | 'regular' | 'medium' | 'semibold';

export interface TypoProps {
  children: React.ReactNode;
  size?: FontSize;
  weight?: FontWeight;
  className?: string;
  testID?: string;
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
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

const Typo = ({
  children,
  size = 'base',
  weight = 'regular',
  className = '',
  testID,
}: TypoProps) => (
  <Text
    accessibilityRole="text"
    className={`text-white ${FONT_SIZE_MAP[size]} ${FONT_WEIGHT_MAP[weight]} ${className}`}
    testID={testID}
  >
    {children}
  </Text>
);

export default Typo;

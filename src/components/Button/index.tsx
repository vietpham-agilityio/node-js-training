import { memo, useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

// Constants
import { Size } from '@/constants/enum';

// Utils
import { cn } from '@/utils/cn';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  isPrimary?: boolean;
  size?: Size;
  disabled?: boolean;
  testID?: string;
  onPress: () => void;
}

const SIZE_CLASSES = {
  [Size.EXTRA_SMALL]: 'py-2.5 px-6',
  [Size.SMALL]: 'py-3 px-3',
  [Size.MEDIUM]: 'py-5 px-1',
  [Size.LARGE]: 'py-5 px-6',
} as const;

const TEXT_SIZE_CLASSES = {
  [Size.EXTRA_SMALL]: 'text-sm leading-4',
  [Size.SMALL]: 'text-base leading-5',
  [Size.MEDIUM]: 'text-base leading-5',
  [Size.LARGE]: 'text-lg leading-6',
} as const;

export const Button = memo(
  ({
    title,
    testID,
    isPrimary = true,
    size = Size.LARGE,
    disabled,
    className,
    onPress,
    ...rest
  }: ButtonProps) => {
    const buttonClassName = useMemo(() => {
      const baseClasses = cn(
        SIZE_CLASSES[size],
        'items-center justify-center rounded-xl',
      );

      return disabled
        ? cn(
            baseClasses,
            'bg-gradient-to-r from-bg-none-active to-bg-none-active',
          )
        : isPrimary
          ? cn(baseClasses, 'bg-gradient-to-r from-secondary to-primary')
          : cn(
              baseClasses,
              'bg-gradient-to-r from-gradient-blue-start to-gradient-blue-end',
            );
    }, [size, disabled, isPrimary]);

    return (
      <TouchableOpacity
        disabled={disabled}
        testID={testID}
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        {...rest}
      >
        <View className={cn(buttonClassName, className)}>
          <Text
            className={cn(
              'font-montserrat-medium text-white text-center',
              TEXT_SIZE_CLASSES[size],
            )}
            testID={`${testID}-text`}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';

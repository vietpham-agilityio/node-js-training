import { memo, useMemo } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

// Utils
import { cn } from '@/utils/cn';

// Components
import { Typo } from '@/components/Typo';

export interface SelectBoxProps extends TouchableOpacityProps {
  value: string;
  isPrimary?: boolean;
  disabled?: boolean;
  testID?: string;
  onPress: () => void;
}

export const SelectBox = memo(
  ({
    value,
    testID,
    isPrimary = true,
    disabled,
    className,
    onPress,
    ...rest
  }: SelectBoxProps) => {
    const SelectBoxClassName = useMemo(() => {
      const baseClasses = 'items-center justify-center rounded-lg';

      return disabled
        ? `${baseClasses} bg-light-navy`
        : isPrimary
          ? `${baseClasses} bg-secondary`
          : `${baseClasses} bg-dark-navy`;
    }, [disabled, isPrimary]);

    return (
      <TouchableOpacity
        disabled={disabled}
        testID={testID}
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={value}
        {...rest}
      >
        <View className={cn(SelectBoxClassName, className)}>
          <Typo weight="medium" className="text-center">
            {value}
          </Typo>
        </View>
      </TouchableOpacity>
    );
  },
);

SelectBox.displayName = 'SelectBox';

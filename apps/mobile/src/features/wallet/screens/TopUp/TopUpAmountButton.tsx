import { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';

// Components
import { Typo } from '@/components/Typo';

// Utils
import { cn } from '@/utils/cn';
import { formatIDR } from '@/utils/formats';

interface TopUpAmountButtonProps {
  amount: number;
  isSelected: boolean;
  onSelect: (amount: number) => void;
}

export const TopUpAmountButton = memo(
  ({ amount, isSelected, onSelect }: TopUpAmountButtonProps) => {
    const handlePress = useCallback(() => {
      onSelect(amount);
    }, [amount, onSelect]);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Select amount ${formatIDR(amount)}`}
        className={cn(
          'flex-1 min-w-[45%] py-2.5 px-8 rounded-lg border-none',
          isSelected ? 'bg-primary' : 'bg-bg-quaternary',
        )}
      >
        <View className="items-center justify-center">
          <Typo className="text-center text-gradient-medium">IDR</Typo>
          <Typo className="text-center">
            {formatIDR(amount, { showCurrency: false })}
          </Typo>
        </View>
      </TouchableOpacity>
    );
  },
);

TopUpAmountButton.displayName = 'TopUpAmountButton';

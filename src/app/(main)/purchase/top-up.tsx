import { Href, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Components
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Typo } from '@/components/Typo';

// Constants
import {
  ERROR_MESSAGES,
  ROUTES,
  TOP_UP_AMOUNTS,
  TOP_UP_MIN_AMOUNT,
  TOP_UP_MAX_AMOUNT,
  Size,
} from '@/constants';

// Hooks
import { useTopUp } from '@/features/wallet/hooks/useWallet';

// Utils
import { cn } from '@/utils';
import { formatIDR } from '@/utils/formats';

// Stores
import { useToastStore } from '@/stores/toast';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);

const TopUpScreen = () => {
  const router = useRouter();

  const { mutate: topUp, isPending } = useTopUp();
  const showError = useToastStore(state => state.showError);

  const [amount, setAmount] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const parsedAmount = useMemo(() => {
    const cleaned = amount.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
  }, [amount]);

  // Handle predefined amount selection
  const handleAmountSelect = useCallback((selectedValue: number) => {
    setSelectedAmount(selectedValue);
    setAmount(formatIDR(selectedValue));
    setError('');
  }, []);

  // Handle manual amount input
  const handleAmountChange = useCallback((text: string) => {
    let cleaned = text.replace(/^IDR\s*/i, '');

    // Remove all non-digit characters except dots (for formatting)
    cleaned = cleaned.replace(/[^\d]/g, '');

    if (!cleaned) {
      setAmount('');
      setSelectedAmount(null);
      setError('');
      return;
    }

    const numValue = parseInt(cleaned, 10);

    // Check if the selected predefined amount matches
    const matchesPredefined = TOP_UP_AMOUNTS.includes(numValue);
    setSelectedAmount(matchesPredefined ? numValue : null);

    // Format and set the amount
    setAmount(formatIDR(numValue));
    setError('');

    // Validate minimum amount
    if (numValue < TOP_UP_MIN_AMOUNT) {
      setError(ERROR_MESSAGES.TOP_UP_MIN_AMOUNT);
    } else if (numValue > TOP_UP_MAX_AMOUNT) {
      setError(ERROR_MESSAGES.TOP_UP_MAX_AMOUNT);
    }
  }, []);

  // Handle top up
  const handleTopUp = useCallback(() => {
    topUp(parsedAmount, {
      onSuccess: () => {
        setAmount('');
        setSelectedAmount(null);

        router.dismissAll();
        router.push(ROUTES.PURCHASE_SUCCESS as Href);
      },
      onError: (error: Error) => {
        showError(error.message || ERROR_MESSAGES.TOP_UP_FAILED);
      },
    });
  }, [parsedAmount, topUp, showError, router]);

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      accessibilityLabel="Top up wallet screen"
      className="flex-1 bg-dark-blue"
    >
      <StyledScrollView
        contentContainerClassName="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input */}
        <View className={cn(error ? 'mb-4.5' : 'mb-9.5')}>
          <Input
            label="Amount"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            error={error}
            testID="top-up-amount-input"
            containerClassName="mb-6"
          />
        </View>

        {/* Predefined Amount Buttons */}
        <View className="mb-22">
          <View className="flex-row flex-wrap gap-5">
            {TOP_UP_AMOUNTS.map(topUpAmount => {
              const isSelected = selectedAmount === topUpAmount;

              return (
                <TouchableOpacity
                  key={topUpAmount}
                  activeOpacity={0.8}
                  onPress={() => handleAmountSelect(topUpAmount)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select amount ${formatIDR(topUpAmount)}`}
                  className={cn(
                    'flex-1 min-w-[45%] py-2.5 px-11 rounded-lg border-none',
                    isSelected ? 'bg-primary' : 'bg-bg-quaternary',
                  )}
                >
                  <View className="items-center justify-center">
                    <Typo className="text-center text-gradient-medium">
                      IDR
                    </Typo>
                    <Typo className="text-center">
                      {formatIDR(topUpAmount, { showCurrency: false })}
                    </Typo>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Top Up Button */}
        <Button
          title="Top Up Now"
          onPress={handleTopUp}
          disabled={isPending || !parsedAmount || parsedAmount === 0 || !!error}
          size={Size.LARGE}
        />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default TopUpScreen;

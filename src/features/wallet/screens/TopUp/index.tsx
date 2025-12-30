import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

// Components
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { TopUpAmountButton } from './TopUpAmountButton';

// Constants
import {
  ERROR_MESSAGES,
  PARAMS,
  ROUTES,
  Size,
  TOP_UP_AMOUNTS,
  TOP_UP_MAX_AMOUNT,
  TOP_UP_MIN_AMOUNT,
} from '@/constants';

// Hooks
import { useTopUp } from '@/features/wallet/hooks/useWallet';

// Utils
import { cn } from '@/utils/cn';
import { formatIDR } from '@/utils/formats';

// Stores
import { useToastStore } from '@/stores/toast';

// Layouts
import { KeyboardLayout } from '@/layouts/KeyboardLayout';

const TopUpScreen = () => {
  const router = useRouter();
  const { fromCheckout } = useLocalSearchParams<{
    [PARAMS.FROM_CHECKOUT]?: string;
  }>();

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
        // Pass fromCheckout param to PurchaseSuccess if user came from checkout
        const successRoute = fromCheckout
          ? `${ROUTES.PURCHASE_SUCCESS}?${PARAMS.FROM_CHECKOUT}=true`
          : ROUTES.PURCHASE_SUCCESS;
        router.push(successRoute as Href);
      },
      onError: (error: Error) => {
        showError(error.message || ERROR_MESSAGES.TOP_UP_FAILED);
      },
    });
  }, [parsedAmount, topUp, showError, router, fromCheckout]);

  return (
    <KeyboardLayout>
      <View className="flex-1 mt-8 pb-20">
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
                <TopUpAmountButton
                  key={topUpAmount}
                  amount={topUpAmount}
                  isSelected={isSelected}
                  onSelect={handleAmountSelect}
                />
              );
            })}
          </View>
        </View>

        {/* Top Up Button */}
        <Button
          testID="top-up-button"
          title="Top Up Now"
          onPress={handleTopUp}
          disabled={isPending || !parsedAmount || parsedAmount === 0 || !!error}
          size={Size.LARGE}
        />
      </View>
    </KeyboardLayout>
  );
};

export default TopUpScreen;

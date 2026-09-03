import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
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
} from '@/constants';

// Hooks
import { useTopUp } from '@/features/wallet/hooks/useWallet';
import { useTopUpEffect } from '@/features/wallet/hooks/useTopupEffect';

// Utils
import { cn } from '@/utils/cn';

// Stores
import { useToastStore } from '@/stores/toast';

// Layouts
import { KeyboardLayout } from '@/layouts/KeyboardLayout';

// Usage in component
const TopUpScreen = () => {
  const router = useRouter();
  const { fromCheckout } = useLocalSearchParams<{
    [PARAMS.FROM_CHECKOUT]?: string;
  }>();

  const { mutate: topUp, isPending } = useTopUp();
  const showError = useToastStore(state => state.showError);

  const { state, setAmount, selectAmount, reset } = useTopUpEffect();

  const handleTopUp = useCallback(() => {
    topUp(state.parsedAmount, {
      onSuccess: () => {
        reset();
        router.dismissAll();
        const successRoute = fromCheckout
          ? `${ROUTES.PURCHASE_SUCCESS}?${PARAMS.FROM_CHECKOUT}=true`
          : ROUTES.PURCHASE_SUCCESS;
        router.push(successRoute as Href);
      },
      onError: (error: Error) => {
        showError(error.message || ERROR_MESSAGES.TOP_UP_FAILED);
      },
    });
  }, [state.parsedAmount, topUp, showError, router, fromCheckout, reset]);

  return (
    <KeyboardLayout>
      <View className="flex-1 mt-8 pb-20">
        {/* Amount Input */}
        <View className={cn(state.error ? 'mb-4.5' : 'mb-9.5')}>
          <Input
            label="Amount"
            value={state.amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            error={state.error}
            testID="top-up-amount-input"
            containerClassName="mb-6"
          />
        </View>

        {/* Predefined Amount Buttons */}
        <View className="mb-22">
          <View className="flex-row flex-wrap gap-5">
            {TOP_UP_AMOUNTS.map(topUpAmount => (
              <TopUpAmountButton
                key={topUpAmount}
                amount={topUpAmount}
                isSelected={state.selectedAmount === topUpAmount}
                onSelect={selectAmount}
              />
            ))}
          </View>
        </View>

        {/* Top Up Button */}
        <Button
          testID="top-up-button"
          title="Top Up Now"
          onPress={handleTopUp}
          disabled={
            isPending ||
            !state.parsedAmount ||
            state.parsedAmount === 0 ||
            !!state.error
          }
          size={Size.LARGE}
        />
      </View>
    </KeyboardLayout>
  );
};

export default TopUpScreen;

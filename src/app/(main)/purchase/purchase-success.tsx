import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

// Constants
import { MESSAGES, ROUTES } from '@/constants';

// Components
import { Button } from '@/components/Button';
import { Typo } from '@/components/Typo';
import { ConfirmationState } from '@/components/ConfirmationState';

// Icons
import { CardCheckedIcon } from '@/icons/CardCheckedIcon';

const CheckoutSuccessScreen = () => {
  const router = useRouter();

  const handleNavigateToMyWallet = useCallback(() => {
    router.replace(ROUTES.MY_WALLET);
  }, [router]);

  const handleNavigateToHome = useCallback(() => {
    router.replace(ROUTES.HOME);
  }, [router]);

  return (
    <View className="flex-1 bg-dark-blue items-center justify-center gap-18">
      <ConfirmationState
        icon={<CardCheckedIcon />}
        title={MESSAGES.PURCHASE_SUCCESS_TITLE}
        description={MESSAGES.PURCHASE_SUCCESS_DESCRIPTION}
      />
      <View className="w-full px-11 gap-4">
        <Button
          title="My Wallet"
          isPrimary
          onPress={handleNavigateToMyWallet}
          accessible
          accessibilityRole="button"
          accessibilityLabel="My Wallet"
          accessibilityHint="Go to my wallet screen"
        />
        <View className="flex-row justify-center items-center gap-1">
          <Typo weight="regular" size="sm">
            Discover new movies?
          </Typo>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Back to home"
            accessibilityHint="Navigates to the home screen"
            onPress={handleNavigateToHome}
          >
            <Typo className="text-text-currency" weight="medium" size="sm">
              Back to home
            </Typo>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default CheckoutSuccessScreen;

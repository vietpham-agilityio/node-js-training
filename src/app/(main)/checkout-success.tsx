import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

// Constants
import { MESSAGES, ROUTES } from '@/constants';

// Components
import { Button, Typo } from '@/components/common';
import { ConfirmationState } from '@/components/feature';

// Icons
import { TicketCheckedIcon } from '@/icons';

const CheckoutSuccessScreen = () => {
  const router = useRouter();

  const handleNavigateToMyTicket = useCallback(() => {
    router.dismissAll();
    router.replace(ROUTES.MY_TICKET);
  }, [router]);

  const handleNavigateToHome = useCallback(() => {
    router.dismissAll();
    router.replace(ROUTES.HOME);
  }, [router]);

  return (
    <View className="flex-1 bg-dark-blue items-center justify-center gap-18">
      <ConfirmationState
        icon={<TicketCheckedIcon />}
        title={MESSAGES.CHECKOUT_SUCCESS_TITLE}
        description={MESSAGES.CHECKOUT_SUCCESS_DESCRIPTION}
      />
      <View className="w-full px-11 gap-4">
        <Button
          title="My Ticket"
          isPrimary
          onPress={handleNavigateToMyTicket}
          accessible
          accessibilityRole="button"
          accessibilityLabel="My Ticket"
          accessibilityHint="Go to my ticket screen"
        />
        <View className="flex-row justify-center items-center gap-1">
          <Typo weight="regular" size="xs">
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

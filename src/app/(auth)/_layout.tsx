// Expo
import { Stack } from 'expo-router';

// Constants
import { SCREENS } from '@/constants';

// Components
import { ScreenHeader } from '@/features/navigation/components/ScreenHeader';

const AuthLayout = () => (
  <Stack
    screenOptions={{
      header: ScreenHeader,
      animation: 'slide_from_right',
      animationTypeForReplace: 'push',
    }}
  >
    <Stack.Screen
      name={SCREENS.AUTH.ONBOARDING}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={SCREENS.AUTH.SIGNIN}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen name={SCREENS.AUTH.SIGNUP} />
    <Stack.Screen name={SCREENS.AUTH.FORGOT_PASSWORD} />
    <Stack.Screen name={SCREENS.AUTH.RESET_PASSWORD} />
  </Stack>
);

export default AuthLayout;

// Expo
import { Stack } from 'expo-router';

// Constants
import { SCREENS } from '@/constants';

// Components
import { ScreenHeader } from '@/components/feature';

const AuthLayout = () => (
  <Stack
    screenOptions={{
      header: ScreenHeader,
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
  </Stack>
);

export default AuthLayout;

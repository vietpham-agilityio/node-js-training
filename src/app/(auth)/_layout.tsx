// Expo
import { Stack } from 'expo-router';

// Constants
import { SCREEN_COLOR_PRIMARY, SCREENS } from '@/constants';

// Components
import { ScreenHeader } from '@/features/navigation/components/ScreenHeader';

// Error Boundary
export { ErrorBoundary } from '@/components/ErrorBoundary';

const AuthLayout = () => (
  <Stack
    screenOptions={{
      header: ScreenHeader,
      contentStyle: { backgroundColor: SCREEN_COLOR_PRIMARY },
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

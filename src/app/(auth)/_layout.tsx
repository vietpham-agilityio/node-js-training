import { Stack } from 'expo-router';

// Constants
import { SCREENS } from '@/constants';

const AuthLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.AUTH.ONBOARDING} />
    <Stack.Screen name={SCREENS.AUTH.SIGNIN} />
    <Stack.Screen name={SCREENS.AUTH.SIGNUP} />
    <Stack.Screen name={SCREENS.AUTH.FORGOT_PASSWORD} />
    <Stack.Screen name={SCREENS.AUTH.CONFIRM_PROFILE} />
  </Stack>
);

export default AuthLayout;

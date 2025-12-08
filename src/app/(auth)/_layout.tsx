import { Stack } from 'expo-router';

// Constants
import { SCREENS } from '@/constants';

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREENS.AUTH.ONBOARDING} />
      <Stack.Screen name={SCREENS.AUTH.SIGNIN} />
      <Stack.Screen name={SCREENS.AUTH.SIGNUP} />
    </Stack>
  );
};

export default AuthLayout;

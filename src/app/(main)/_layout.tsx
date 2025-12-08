import { Stack } from 'expo-router';

// Constants
import { SCREENS } from '@/constants';

const MainLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.TABS.LAYOUT} />
  </Stack>
);

export default MainLayout;

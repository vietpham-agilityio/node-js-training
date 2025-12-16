import { Stack } from 'expo-router';

// Constants
import { SCREENS } from '@/constants';

// Components
import { ScreenHeader } from '@/components/feature';

const MainLayout = () => (
  <Stack
    screenOptions={{
      header: ScreenHeader,
    }}
  >
    <Stack.Screen
      name={SCREENS.MAIN.WELCOME}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={SCREENS.TABS.LAYOUT}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={SCREENS.MAIN.MOVIES}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name={SCREENS.MAIN.CINEMA}
    />
    <Stack.Screen name={SCREENS.MAIN.CHECKOUT} />
    <Stack.Screen
      name={SCREENS.MAIN.SEARCH}
      options={{
        presentation: 'containedModal',
        animation: 'slide_from_bottom',
      }}
    />
  </Stack>
);

export default MainLayout;

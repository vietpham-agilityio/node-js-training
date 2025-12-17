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
    <Stack.Screen name={SCREENS.MAIN.CINEMA} />
    <Stack.Screen name={SCREENS.MAIN.TICKETS} />
    <Stack.Screen name={SCREENS.MAIN.SEATS} />
    <Stack.Screen
      name={SCREENS.MAIN.CHECKOUT_SUCCESS}
      options={{
        headerShown: false,
        gestureEnabled: false,
      }}
    />
    <Stack.Screen
      name={SCREENS.MAIN.PURCHASE_SUCCESS}
      options={{
        headerShown: false,
        gestureEnabled: false,
      }}
    />
    <Stack.Screen name={SCREENS.MAIN.CHECKOUT} />
    <Stack.Screen
      name={SCREENS.MAIN.SEARCH}
      options={{
        presentation: 'containedModal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen name={SCREENS.MAIN.PROFILE} />
    <Stack.Screen name={SCREENS.MAIN.PROFILE_EDIT} />
  </Stack>
);

export default MainLayout;

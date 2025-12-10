import { StatusBar } from 'expo-status-bar';
import { Fragment, useEffect } from 'react';

// Uniwind
import { useUniwind } from 'uniwind';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Router
import { Stack, useRouter, useSegments } from 'expo-router';

// SplashScreen
import * as SplashScreen from 'expo-splash-screen';

// Font
import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  useFonts,
} from '@expo-google-fonts/montserrat';

// Constants
import { ROUTES, SCREENS } from '@/constants';

// Hooks
import { useAuth } from '@/hooks';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

const StorybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

export const unstable_settings = {
  initialRouteName: StorybookEnabled ? SCREENS.STORYBOOK : SCREENS.AUTH.LAYOUT,
};

const RootLayout = () => {
  const { theme } = useUniwind();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [loaded, error] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Handle authentication routing
  useEffect(() => {
    if (isLoading || !loaded) return;

    const inAuthGroup = segments[0] === SCREENS.AUTH.LAYOUT;

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace(ROUTES.ONBOARDING);
    } else if (isAuthenticated && inAuthGroup) {
      const currentScreen = segments[segments.length - 1];

      const isComingFromRegister = currentScreen === SCREENS.AUTH.SIGNUP;

      if (isComingFromRegister) {
        router.replace(ROUTES.WELCOME);
      } else {
        router.replace(ROUTES.HOME);
      }
    }

    // Hide splash screen
    SplashScreen.hideAsync();
  }, [isAuthenticated, segments, isLoading, loaded, router]);

  if (!loaded) {
    return null;
  }

  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Storybook - Only accessible when enabled */}
          <Stack.Protected guard={StorybookEnabled}>
            <Stack.Screen name={SCREENS.STORYBOOK} />
          </Stack.Protected>

          {/* Auth screens - Only accessible when NOT authenticated */}
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name={SCREENS.AUTH.LAYOUT} />
          </Stack.Protected>

          {/* Protected screens - Only accessible when authenticated */}
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name={SCREENS.MAIN.LAYOUT} />
          </Stack.Protected>
        </Stack>
        <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      </QueryClientProvider>
    </Fragment>
  );
};

export default RootLayout;

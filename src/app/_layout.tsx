import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { Fragment, useEffect, useRef } from 'react';

// Effect
import { Data, Effect, Schema } from 'effect';

// Uniwind
import { Uniwind, useUniwind } from 'uniwind';

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
import { ROUTES, SCREEN_COLOR_PRIMARY, SCREENS } from '@/constants';

// Hooks
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Components
import { Loading } from '@/components/Loading';
import { Toast } from '@/components/Toast';

// Error Boundary
export { ErrorBoundary } from '@/components/ErrorBoundary';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(SCREEN_COLOR_PRIMARY);

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

const Pokemon = Schema.Struct({
  id: Schema.Number,
  order: Schema.Number,
  name: Schema.String,
  height: Schema.Number,
  weight: Schema.Number,
});

const decodePokemon = Schema.decodeUnknown(Pokemon);

class FetchPokemonErr extends Data.TaggedError('FetchPokemonErr')<{
  customMessage: string;
}> {}

class ExtractResponseErr extends Data.TaggedError('ExtractResponseErr') {}

class SaveResponseErr extends Data.TaggedError('SaveResponseErr') {}

const RootLayout = () => {
  const { theme } = useUniwind();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const fetchPokemon: Effect.Effect<Response, FetchPokemonErr> =
    Effect.tryPromise({
      try: () => fetch('https://pokeapi.co/api/v2/pokemon/ditto'),
      catch: () =>
        new FetchPokemonErr({ customMessage: 'Fetch Pokemon went wrong' }),
    });

  const extractResponse = (res: Response) =>
    Effect.tryPromise({
      try: () => res.json(),
      catch: () => new ExtractResponseErr(),
    });

  const savePokemon = (pokemon: unknown) =>
    Effect.tryPromise({
      try: () => fetch('/api/pokemon', { body: JSON.stringify(pokemon) }),
      catch: () => new SaveResponseErr(),
    });

  // // Effect pipeline: fetch -> validate -> extract JSON -> save
  // // Each step transforms the value or can fail with a typed error
  // const printPokemon = fetchPokemon.pipe(
  //   // Validate response - if res.ok is false, fail with FetchPokemonErr
  //   // filterOrFail acts as a guard: passes value through if predicate is true,
  //   // otherwise fails with the provided error
  //   Effect.filterOrFail(
  //     res => res.ok, // just have res when status is 200
  //     () => new FetchPokemonErr({ customMessage: 'Fetch Pokemon went wrong' }),
  //   ),
  //   Effect.flatMap(extractResponse),
  //   Effect.flatMap(savePokemon),

  //   // catch all errors
  //   Effect.catchTags({
  //     FetchPokemonErr: err => Effect.succeed(err.customMessage),
  //     ExtractResponseErr: () => Effect.succeed('Extract Response went wrong'),
  //     SaveResponseErr: () => Effect.succeed('Save Response went wrong'),
  //   }),
  // );

  const printPokemon = Effect.gen(function* () {
    const res = yield* fetchPokemon;

    if (!res.ok)
      yield* new FetchPokemonErr({ customMessage: 'Fetch Pokemon went wrong' });

    const jsonRes = yield* extractResponse(res);
    const decodedPokemon = yield* decodePokemon(jsonRes);

    yield* savePokemon(decodedPokemon);

    return decodedPokemon;
  });

  const handlePrintPokemon = printPokemon.pipe(
    Effect.catchTags({
      FetchPokemonErr: err => Effect.succeed(err.customMessage),
      ExtractResponseErr: () => Effect.succeed('Extract Response went wrong'),
      SaveResponseErr: () => Effect.succeed('Save Response went wrong'),
      ParseError: () => Effect.succeed('Parse Pokemon Error'),
    }),
  );

  Effect.runPromise(handlePrintPokemon).then(console.log);

  const doubleNum = (num: number) => Effect.succeed(num * 2);

  const numEffect = Effect.succeed(10);

  const doubleNumEffect = numEffect.pipe(Effect.flatMap(doubleNum));

  const result = Effect.runSync(doubleNumEffect);

  console.log(result);

  // Track previous authentication state to detect logout vs fresh install
  const prevIsAuthenticatedRef = useRef<boolean | null>(null);
  const hasInitializedRef = useRef(false);

  // Initialize push notifications
  usePushNotifications();

  const [loaded, error] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    Uniwind.setTheme('dark');
  }, []);

  // Handle authentication routing
  useEffect(() => {
    if (isLoading || !loaded) return;

    if (StorybookEnabled) {
      // If storybook is enabled, do not perform any redirects
      SplashScreen.hideAsync();
      return;
    }

    // Track if this is the first initialization
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevIsAuthenticatedRef.current = isAuthenticated;
    }

    const inAuthGroup = segments[0] === SCREENS.AUTH.LAYOUT;

    if (!isAuthenticated && !inAuthGroup) {
      // Detect logout: user was authenticated before but now is not
      // Fresh install: user was never authenticated (prevIsAuthenticatedRef is null or false)
      const wasAuthenticatedBefore = prevIsAuthenticatedRef.current === true;
      const isLogout = wasAuthenticatedBefore && !isAuthenticated;

      // Only redirect to signin if user logged out (was authenticated before)
      // Otherwise, redirect to onboarding for new users
      router.replace(isLogout ? ROUTES.LOGIN : ROUTES.ONBOARDING);
    } else if (isAuthenticated && inAuthGroup) {
      const currentScreen = segments[segments.length - 1];

      const isComingFromRegister = currentScreen === SCREENS.AUTH.SIGNUP;

      if (isComingFromRegister) {
        router.replace(ROUTES.WELCOME);
      } else {
        router.replace(ROUTES.HOME);
      }
    }

    // Update previous authentication state
    prevIsAuthenticatedRef.current = isAuthenticated;

    // Hide splash screen
    SplashScreen.hideAsync();
  }, [isAuthenticated, segments, isLoading, loaded, router]);

  if (!loaded) {
    return null;
  }

  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: SCREEN_COLOR_PRIMARY },
          }}
        >
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
        <Toast />
        <Loading />
      </QueryClientProvider>
    </Fragment>
  );
};

export default RootLayout;

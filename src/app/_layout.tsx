import { useEffect } from "react";

// Router
import { Stack } from "expo-router";

// SplashScreen
import * as SplashScreen from "expo-splash-screen";

// Font
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

// Style
import "./../global.css";

SplashScreen.preventAutoHideAsync();
const isStorybook = process.env.EXPO_PUBLIC_ENVIRONMENT === "storybook";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (isStorybook && __DEV__) {
    const StorybookUI = require("../../.rnstorybook").default;
    return <StorybookUI />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="storybook" options={{ title: "Storybook" }} />
      </Stack.Protected>
    </Stack>
  );
}

import { useEffect } from "react";

// Router
import { Stack } from "expo-router";

// SplashScreen
import * as SplashScreen from "expo-splash-screen";

// Font
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_500Medium,
  Montserrat_300Light,
} from "@expo-google-fonts/montserrat";

// Style
import "./../global.css";
import { View, Text } from "react-native";

SplashScreen.preventAutoHideAsync();
const isStorybook = process.env.EXPO_PUBLIC_ENVIRONMENT === "storybook";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
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
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0b0f2f",
        },
        headerBackVisible: false,
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontFamily: "Montserrat_600SemiBold",
          fontSize: 20,
        },
        // header: () => <View className="bg-dark-blue h-40 p-10"><Text className="text-white">Header</Text></View>,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="storybook" options={{ title: "Storybook" }} />
      </Stack.Protected>
    </Stack>
  );
}

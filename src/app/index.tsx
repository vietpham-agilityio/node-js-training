// SDK

import { ScrollView, Text, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import ErrorFeedback from "../components/ErrorFeedback";

const Home = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-100">
        <ScrollView className="flex-1">
          <View className="flex-1 items-center">
            <Text className="text-blue-500 text-2xl font-montserrat">
              Montserrat font
            </Text>
          </View>
        </ScrollView>
        <ErrorFeedback error="Just error testing" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Home;

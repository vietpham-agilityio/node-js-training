import { ScrollView, Text, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const Home = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <ScrollView className="w-full h-full bg-dark-blue">
          <View className="flex-1 items-center">
            <Text className="text-red text-2xl font-montserrat-semibold">
              Montserrat font
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Home;

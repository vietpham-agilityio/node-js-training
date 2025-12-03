import { Text, View } from "react-native";

const ErrorFeedback = ({ error }: { error: string }) => (
  <View className="bg-bg-warning p-2.5 rounded-base">
    <Text className="text-white font-montserrat-medium text-3xl">{error}</Text>
  </View>
);

export default ErrorFeedback;

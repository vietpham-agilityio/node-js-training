import { View, Text, StyleSheet } from "react-native";

const ErrorFeedback = ({ error }: { error: string }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
  </View>
);

const styles = StyleSheet.create({
  errorContainer: {
    padding: 10,
    backgroundColor: "red",
  },
  errorText: {
    color: "white",
  },
});

export default ErrorFeedback;

import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  return (
    <SafeAreaView
      edges={['top']}
      accessibilityLabel="Home screen"
      accessibilityHint="Home screen"
    ></SafeAreaView>
  );
};

export default HomeScreen;

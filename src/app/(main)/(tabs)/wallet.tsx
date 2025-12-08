import { SafeAreaView } from 'react-native-safe-area-context';

const WalletScreen = () => {
  return (
    <SafeAreaView
      edges={['top']}
      accessibilityLabel="Wallet screen"
      accessibilityHint="Wallet screen"
    ></SafeAreaView>
  );
};

export default WalletScreen;

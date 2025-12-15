import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const WalletScreen = () => {
  return (
    <StyledSafeAreaView
      edges={['bottom']}
      accessibilityLabel="Wallet screen"
      accessibilityHint="Wallet screen"
      className="h-full bg-bg-primary"
    >
      <ScrollView contentContainerClassName=" flex-1 items-center bg-dark-blue"></ScrollView>
    </StyledSafeAreaView>
  );
};

export default WalletScreen;

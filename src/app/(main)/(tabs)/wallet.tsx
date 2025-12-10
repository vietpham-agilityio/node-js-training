import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { useResolveClassNames } from 'uniwind';

const WalletScreen = () => {
  const containerStyles = useResolveClassNames('flex-1');

  return (
    <SafeAreaView
      edges={['top']}
      accessibilityLabel="Wallet screen"
      accessibilityHint="Wallet screen"
      style={containerStyles}
    >
      <ScrollView contentContainerClassName=" flex-1 items-center bg-dark-blue"></ScrollView>
    </SafeAreaView>
  );
};

export default WalletScreen;

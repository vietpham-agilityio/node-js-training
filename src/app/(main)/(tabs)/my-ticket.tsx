import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { useResolveClassNames } from 'uniwind';

const MyTicketScreen = () => {
  const containerStyles = useResolveClassNames('flex-1');

  return (
    <SafeAreaView
      edges={['top']}
      accessibilityLabel="My Ticket screen"
      accessibilityHint="My Ticket screen"
      style={containerStyles}
    >
      <ScrollView contentContainerClassName=" flex-1 items-center bg-dark-blue"></ScrollView>
    </SafeAreaView>
  );
};

export default MyTicketScreen;

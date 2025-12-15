import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const MyTicketScreen = () => {
  return (
    <StyledSafeAreaView
      edges={['bottom']}
      accessibilityLabel="My Ticket screen"
      accessibilityHint="My Ticket screen"
      className="h-full bg-bg-primary"
    >
      <ScrollView contentContainerClassName=" flex-1 items-center bg-dark-blue"></ScrollView>
    </StyledSafeAreaView>
  );
};

export default MyTicketScreen;

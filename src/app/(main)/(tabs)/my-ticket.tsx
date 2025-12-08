import { SafeAreaView } from 'react-native-safe-area-context';

const MyTicketScreen = () => {
  return (
    <SafeAreaView
      edges={['top']}
      accessibilityLabel="My Ticket screen"
      accessibilityHint="My Ticket screen"
    ></SafeAreaView>
  );
};

export default MyTicketScreen;

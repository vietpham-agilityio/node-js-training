import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Constants
import { ERROR_MESSAGES, MESSAGES } from '@/constants';

// Components
import { Button } from '@/components/common';

// Hooks
import { useAuth } from '@/hooks';

const HomeScreen = () => {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(MESSAGES.SIGN_OUT, MESSAGES.SIGN_OUT_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert(ERROR_MESSAGES.SIGN_OUT_FAILED);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={['top']}
      accessibilityLabel="Home screen"
      accessibilityHint="Home screen"
    >
      <Button
        title=" Sign Out"
        onPress={handleSignOut}
        className="bg-error rounded-xl p-4"
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, View } from 'react-native';

// Constants
import { ROUTES } from '@/constants';

// Components
import { Avatar, Button, Typo } from '@/components/common';
import { AccessLayout } from '@/components/layouts';

// Hooks
import { useUploadAvatar } from '@/hooks';

const ConfirmProfileScreen = () => {
  const { fullName, avatarUrl } = useLocalSearchParams();
  const route = useRouter();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  const avatarSource = Array.isArray(avatarUrl) ? avatarUrl[0] : avatarUrl;
  const username = Array.isArray(fullName) ? fullName[0] : fullName;

  const handleCreateAccount = () => {
    // Navigate to main app or login
    uploadAvatar(
      {
        uri: avatarSource,
      },
      {
        onSuccess: () => {
          route.replace(ROUTES.HOME);
        },
        onError: (error: Error) => {
          Alert.alert(
            'Sign Up Failed',
            error.message || 'Failed to create account',
          );
        },
      },
    );
  };

  return (
    <AccessLayout mode="signup">
      <View className="flex-col items-center">
        {/* Avatar Display */}
        <View className="mb-8">
          <Avatar
            size={160}
            variant="default"
            source={avatarSource}
            accessibilityLabel="Profile picture preview"
          />
        </View>

        {/* Welcome Message */}
        <View className="mb-24" accessible accessibilityElementsHidden={false}>
          <Typo
            className="text-lg text-gray-300 text-center mb-2"
            accessibilityRole="header"
            accessibilityLabel="Welcome"
          >
            Welcome
          </Typo>
          <Typo
            className="text-2xl font-bold text-white text-center"
            accessibilityRole="header"
            accessibilityLabel={`Account name: ${username}`}
          >
            {username}
          </Typo>
        </View>

        {/* Create Account Button */}
        <Button
          disabled={isUploading}
          className="w-full"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Confirm my account"
          accessibilityHint="Creates your account and continues to the home screen"
          title={isUploading ? 'Creating account...' : 'Confirm My Account'}
          onPress={handleCreateAccount}
        />
      </View>
    </AccessLayout>
  );
};

export default ConfirmProfileScreen;

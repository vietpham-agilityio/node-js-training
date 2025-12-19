import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

// Constants
import { ROUTES } from '@/constants';

// Components
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Typo } from '@/components/Typo';

// Layouts
import { AccessLayout } from '@/layouts/AcessLayout';

// Hooks
import { useProfile } from '@/features/setting/hooks/useProfile';

const WelcomeScreen = () => {
  const route = useRouter();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const handleExploreMovies = () => {
    route.replace(ROUTES.HOME);
  };

  if (isProfileLoading) {
    return (
      <View
        className="flex-1 justify-center items-center pt-16 pb-16 bg-bg-primary"
        accessibilityLabel="Loading news"
        accessibilityHint="Loading news"
      >
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <AccessLayout mode="signup">
      <View className="flex-col items-center mt-24">
        {/* Avatar Display */}
        <View className="mb-8">
          <Avatar
            size={160}
            variant="default"
            source={profile?.avatarUrl}
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
            accessibilityLabel={`Account name: ${profile?.fullName}`}
          >
            {profile?.fullName}
          </Typo>
        </View>

        {/* Create Account Button */}
        <Button
          className="w-full"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Explore movies"
          accessibilityHint="Explore Movies and continues to the home screen"
          title="Explore Movies"
          onPress={handleExploreMovies}
        />
      </View>
    </AccessLayout>
  );
};

export default WelcomeScreen;

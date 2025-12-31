import { useRouter } from 'expo-router';
import { View } from 'react-native';

// Uniwind
import { useResolveClassNames } from 'uniwind';

// Constants
import { ROUTES } from '@/constants';

// Components
import { Button } from '@/components/Button';
import { Typo } from '@/components/Typo';

// Layout
import { AccessLayout } from '@/layouts/AccessLayout';

// Icons
import { AppIcon } from '@/icons/AppIcon';

const OnboardingScreen = () => {
  const navigate = useRouter();

  const handleNavigateToSignin = () => {
    navigate.push(ROUTES.LOGIN);
  };

  const appIconColorConfig = useResolveClassNames('text-white bg-secondary');

  return (
    <AccessLayout mode="onboarding">
      <View className="flex-1 items-center justify-center">
        <View
          className="mb-13"
          accessible
          accessibilityRole="image"
          accessibilityLabel="App logo"
          testID="on-boarding-app-icon"
        >
          <AppIcon
            color={appIconColorConfig.color as string}
            stopColor={appIconColorConfig.backgroundColor as string}
          />
        </View>
        <Typo
          size="2xl"
          weight="medium"
          accessibilityRole="header"
          testID="on-boarding-title"
        >
          New Experience
        </Typo>
        <Typo
          size="lg"
          weight="light"
          className="max-w-60 text-center mt-4"
          testID="on-boarding-description"
        >
          Watch a new movie much easier than any before
        </Typo>
        <View className="w-full px-11 mt-18">
          <Button
            title="Get Started"
            testID="get-started-button"
            isPrimary={false}
            onPress={handleNavigateToSignin}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Get started"
            accessibilityHint="Go to sign in screen"
          />
        </View>
      </View>
    </AccessLayout>
  );
};

export default OnboardingScreen;

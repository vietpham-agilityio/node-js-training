import { View } from 'react-native';
import { useRouter } from 'expo-router';

// Uniwind
import { useResolveClassNames } from 'uniwind';

// Constants
import { ROUTES } from '@/constants';

// Components
import { Typo } from '@/components/Typo';
import { Button } from '@/components/Button';

// Layout
import { AccessLayout } from '@/layouts/AccessLayout';

// Icons
import { AppIcon } from '@/icons';

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
        >
          <AppIcon
            color={appIconColorConfig.color as string}
            stopColor={appIconColorConfig.backgroundColor as string}
          />
        </View>
        <Typo size="2xl" weight="medium" accessibilityRole="header">
          New Experience
        </Typo>
        <Typo size="lg" weight="light" className="max-w-60 text-center mt-4">
          Watch a new movie much easier than any before
        </Typo>
        <View className="w-full px-11 mt-18">
          <Button
            title="Get Started"
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

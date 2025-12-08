import { View } from 'react-native';
import { useRouter } from 'expo-router';

// Constants
import { ROUTES } from '@/constants';

// Components
import { Typo, Button } from '@/components/common';
import { AccessLayout } from '@/components/layouts';

// Icons
import { AppIcon } from '@/icons';

const OnboardingScreen = () => {
  const navigate = useRouter();

  const handleNavigateToSignin = () => {
    navigate.push(ROUTES.LOGIN);
  };

  return (
    <AccessLayout mode="onboarding">
      <View className="flex-1 items-center justify-center">
        <View className="mb-13">
          <AppIcon />
        </View>
        <Typo size="2xl" weight="medium">
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
          />
        </View>
      </View>
    </AccessLayout>
  );
};

export default OnboardingScreen;

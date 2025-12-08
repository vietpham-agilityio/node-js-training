// Components
import { Typo } from '@/components/common';
import { AccessLayout } from '@/components/layouts';
import { View } from 'react-native';

const OnboardingScreen = () => {
  return (
    <AccessLayout mode="onboarding">
      <View className="flex-col items-center">
        <Typo size="2xl" weight="medium">
          New Experience
        </Typo>
        <Typo size="lg" weight="light" className="max-w-60 text-center">
          Watch a new movie much easier than any before
        </Typo>
      </View>
    </AccessLayout>
  );
};

export default OnboardingScreen;

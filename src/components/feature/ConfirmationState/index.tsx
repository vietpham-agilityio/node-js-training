import { ReactNode } from 'react';
import { View } from 'react-native';

// Components
import { Typo } from '@/components/common';

export const ConfirmationState = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <View className="items-center justify-center">
    <View
      className="mb-18"
      accessible
      accessibilityRole="image"
      accessibilityLabel="confirmation state icon"
    >
      {icon}
    </View>
    <Typo
      size="2xl"
      weight="medium"
      accessibilityRole="header"
      accessibilityLabel={`confirmation state title: ${title}`}
    >
      {title}
    </Typo>
    <Typo
      weight="light"
      className="max-w-48 text-center mt-4"
      accessibilityRole="text"
      accessibilityLabel={`confirmation state description: ${description}`}
    >
      {description}
    </Typo>
  </View>
);

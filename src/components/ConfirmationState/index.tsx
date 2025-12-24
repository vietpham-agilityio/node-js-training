import { ComponentType, memo } from 'react';
import { View } from 'react-native';
import { SvgProps } from 'react-native-svg';

// Components
import { Typo } from '../Typo';

export const ConfirmationState = memo(
  ({
    icon,
    title,
    description,
  }: {
    icon: ComponentType<SvgProps>;
    title: string;
    description: string;
  }) => {
    const Icon = icon;

    return (
      <View className="items-center justify-center">
        <View
          className="mb-18"
          accessible
          accessibilityRole="image"
          accessibilityLabel="confirmation state icon"
        >
          <Icon />
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
  },
);

ConfirmationState.displayName = 'ConfirmationState';

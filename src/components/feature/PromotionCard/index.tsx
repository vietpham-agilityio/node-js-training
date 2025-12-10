/* eslint-disable import/no-unresolved */
import { memo } from 'react';
import { View } from 'react-native';

// Assets
import PromotionImage from '@assets/images/promotion-background-image.webp';

// Expo
import { ImageBackground } from 'expo-image';

// Unwind
import { useResolveClassNames } from 'uniwind';

// Components
import { Typo } from '@/components/common';

interface PromotionCardProps {
  title: string;
  subtitle: string;
  discount: string;
}

export const PromotionCard = memo(
  ({ title, subtitle, discount }: PromotionCardProps) => {
    const imageBackgroundStyles = useResolveClassNames(
      'rounded-xl overflow-hidden',
    );

    return (
      <View className="w-full h-21 rounded-xl">
        <ImageBackground
          source={PromotionImage}
          contentFit="cover"
          style={imageBackgroundStyles}
        >
          <View className="flex-row items-center justify-between h-full px-5">
            {/* Left Section - Title and Subtitle */}
            <View className="flex-1">
              <Typo size="sm" weight="regular" className="mb-1">
                {title}
              </Typo>
              <Typo size="xs" weight="light" className="text-gradient-white">
                {subtitle}
              </Typo>
            </View>

            {/* Right Section - Discount */}
            <View className="items-end gap-1 flex-row">
              <Typo size="base" weight="regular">
                OFF
              </Typo>
              <Typo size="base" weight="semibold">
                {discount}
              </Typo>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  },
);

PromotionCard.displayName = 'PromotionCard';

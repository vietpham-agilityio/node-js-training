import { memo } from 'react';
import { View } from 'react-native';

// Assets
import PromotionImage from '@assets/images/promotion-background-image.webp';

// Expo
import { ImageBackground } from 'expo-image';

// Unwind
import { useResolveClassNames } from 'uniwind';

// Components
import { Typo } from '@/components/Typo';

// Constants
import { PromoCodeStatus } from '@/features/booking/schemas/movie';
import { PROMO_CODE_STATUS } from '@/constants/status';

interface PromotionCardProps {
  description?: string;
  discountType?: PromoCodeStatus;
  code: string;
  discountValue: number;
}

export const PromotionCard = memo(
  ({
    code,
    description,
    discountValue,
    discountType = PROMO_CODE_STATUS.PERCENTAGE,
  }: PromotionCardProps) => {
    const imageBackgroundStyles = useResolveClassNames(
      'rounded-xl overflow-hidden',
    );

    return (
      <View
        className="w-full h-21 rounded-xl"
        accessible
        accessibilityRole="image"
        accessibilityLabel="Promotion card"
        accessibilityHint="Apply promotion code"
      >
        <ImageBackground
          source={PromotionImage}
          contentFit="cover"
          style={imageBackgroundStyles}
        >
          <View className="flex-row items-center justify-between h-full px-5">
            {/* Left Section - Title and Subtitle */}
            <View className="flex-1">
              <Typo size="sm" weight="regular" className="mb-1">
                {code}
              </Typo>
              {description && (
                <Typo size="xs" weight="light" className="text-white/90">
                  {description}
                </Typo>
              )}
            </View>

            {/* Right Section - Discount */}
            <View className="items-end gap-1 flex-row">
              <Typo size="base" weight="regular">
                OFF
              </Typo>
              <Typo size="base" weight="semibold">
                {discountValue}
                {discountType === PROMO_CODE_STATUS.PERCENTAGE && '%'}
              </Typo>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  },
);

PromotionCard.displayName = 'PromotionCard';

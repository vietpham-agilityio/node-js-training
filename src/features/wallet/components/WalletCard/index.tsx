import { ImageBackground } from 'expo-image';
import { memo } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';

// Assets
import Card from '@assets/images/card.webp';

// Utils
import { formatCardNumber, formatCurrency, formatIDR } from '@/utils/formats';

// Components
import { Typo } from '@/components/Typo';

interface WalletCardProps {
  balance: number;
  currency?: string;
  cardNumber?: string;
  cardName?: string;
  accessibilityLabel?: string;
  onPress?: () => void;
}

export const { width: SCREEN_WIDTH } = Dimensions.get('screen');
export const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 400);
export const CARD_HEIGHT = (CARD_WIDTH * 195) / 327;

export const WalletCard = memo(
  ({
    balance,
    currency = 'IDR',
    cardNumber = '6032 1506 4207 2004',
    cardName = 'Arya Wijaya',
    accessibilityLabel,
    onPress,
  }: WalletCardProps) => {
    const balanceFormatted = formatIDR(balance);
    const cardNumberFormatted = formatCardNumber(cardNumber);

    return (
      <TouchableOpacity
        testID="wallet-card"
        onPress={onPress}
        activeOpacity={0.9}
        className="w-full justify-center items-center rounded-xl overflow-hidden shadow-lg"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityLabel={
          accessibilityLabel ||
          `Wallet balance ${currency} ${formatCurrency(balance)}, Card holder ${cardName}${onPress ? '. Tap to top up' : ''}`
        }
      >
        <ImageBackground
          source={Card}
          contentFit="cover"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {/* Content Container */}
          <View className="h-full justify-between items-start p-6">
            {/* Header */}
            <View className="items-start gap-1">
              <Typo
                size="2xs"
                weight="regular"
                className="text-white/70"
                accessibilityRole="text"
              >
                Card Name
              </Typo>

              <Typo
                testID="wallet-card-name"
                size="base"
                weight="semibold"
                className="text-white"
                accessibilityRole="text"
                accessibilityLabel={`Card holder: ${cardName}`}
              >
                {cardName}
              </Typo>
            </View>

            {/* Card Number */}
            <Typo
              testID="wallet-card-number"
              size="lg"
              weight="semibold"
              className="text-white truncate line-clamp-2"
              accessibilityRole="text"
              accessibilityLabel={`Card number: ${cardNumberFormatted}`}
            >
              {cardNumberFormatted}
            </Typo>

            {/* Balance Section */}
            <Typo
              testID="wallet-balance"
              size="2xl"
              weight="semibold"
              className="text-white truncate line-clamp-1"
              accessibilityRole="text"
              accessibilityLabel={`Balance: ${balanceFormatted}`}
            >
              {balanceFormatted}
            </Typo>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  },
);

WalletCard.displayName = 'WalletCard';

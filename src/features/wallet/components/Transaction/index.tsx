import { memo, useMemo } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

// Components
import { Typo } from '@/components/Typo';

// Icons
import { MovieTopUpIcon } from '@/icons/MovieTopUpIcon';

// Types
import { WalletTransactionType } from '@/features/wallet/types/wallet';

// Utils
import { cn } from '@/utils/cn';
import { formatIDR, formatShowtimeDate } from '@/utils/formats';

interface TransactionProps extends Omit<TouchableOpacityProps, 'children'> {
  className?: string;
  description: string;
  createdAt: string;
  amount: number;
  transactionType: WalletTransactionType;
}

const WalletTransactionColor: Record<WalletTransactionType, string> = {
  [WalletTransactionType.TOP_UP]: 'text-text-success',
  [WalletTransactionType.PAYMENT]: 'text-text-error',
  [WalletTransactionType.REFUND]: 'text-text-primary',
};

export const Transaction = memo(
  ({
    description,
    createdAt,
    amount,
    transactionType,
    className = '',
    ...rest
  }: TransactionProps) => {
    const showtimeDateText = useMemo(
      () => formatShowtimeDate(createdAt, createdAt),
      [createdAt],
    );

    return (
      <TouchableOpacity
        accessible
        testID="transaction"
        activeOpacity={1}
        accessibilityLabel={description}
        accessibilityHint="Tap to view transaction details"
        className={cn('w-full flex-row rounded-xl pr-4 gap-4', className)}
        {...rest}
      >
        {/* Left Section - Movie Poster */}
        <View className="relative rounded-lg overflow-hidden">
          <MovieTopUpIcon />
        </View>

        {/* Right Section - Movie Details */}
        <View className="flex-1 gap-3 justify-center">
          {/* Title */}
          <Typo
            size="base"
            weight="medium"
            className="leading-5"
            testID="transaction-title"
            accessibilityRole="text"
            accessibilityLabel={description}
          >
            {description}
          </Typo>

          <View className="gap-1">
            {/* Price */}
            {amount && (
              <Typo
                size="sm"
                weight="regular"
                className={cn(
                  'text-white',
                  transactionType && WalletTransactionColor[transactionType],
                )}
                testID="transaction-price"
              >
                {formatIDR(amount)}
              </Typo>
            )}

            {/* Showtime and Date */}
            {showtimeDateText && (
              <Typo
                size="sm"
                weight="regular"
                className="text-white"
                testID="transaction-showtime"
              >
                {showtimeDateText}
              </Typo>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

Transaction.displayName = 'Transaction';

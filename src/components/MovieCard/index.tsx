import { memo, useMemo } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

// Expo
import { Image } from 'expo-image';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { BLUR_HASH, IMAGE_SIZE_MAP, Size } from '@/constants';

// Components
import { Rating } from '../Rating';
import { Typo } from '../Typo';

// Types
import { WalletTransactionType } from '@/features/wallet/types/wallet';

// Utils
import { cn } from '@/utils/cn';
import {
  formatIDR,
  formatMovieDuration,
  formatShowtimeDate,
} from '@/utils/formats';

interface MovieCardProps extends Omit<TouchableOpacityProps, 'children'> {
  title: string;
  posterUrl: string;
  durationMinutes?: number;
  genre?: string[];
  rating?: number;
  cinemaLocation?: string;
  cinemaName?: string;
  showtime?: string;
  showDate?: string;
  price?: string;
  imageSize?: Size;
  className?: string;
  transactionType?: WalletTransactionType;
  justifyContent?: 'center' | 'end';
}

const StyledImage = withUniwind(Image);

const WalletTransactionColor: Record<WalletTransactionType, string> = {
  [WalletTransactionType.TOP_UP]: 'text-text-success',
  [WalletTransactionType.PAYMENT]: 'text-text-error',
  [WalletTransactionType.REFUND]: 'text-text-primary',
};

export const MovieCard = memo(
  ({
    title,
    posterUrl,
    durationMinutes,
    rating,
    genre,
    cinemaLocation,
    cinemaName,
    showtime,
    showDate,
    price,
    imageSize = Size.SMALL,
    transactionType,
    className = '',
    justifyContent = 'end',
    ...rest
  }: MovieCardProps) => {
    const imageSizeClassName = useMemo(
      () => IMAGE_SIZE_MAP[imageSize as keyof typeof IMAGE_SIZE_MAP],
      [imageSize],
    );

    const genresText = useMemo(() => genre?.join(', '), [genre]);

    const showtimeDateText = useMemo(
      () => formatShowtimeDate(showtime, showDate),
      [showtime, showDate],
    );

    const hasBookingInfo = useMemo(
      () => showtimeDateText || price || cinemaLocation || cinemaName,
      [showtimeDateText, price, cinemaLocation, cinemaName],
    );

    return (
      <TouchableOpacity
        testID="movie-card"
        accessibilityLabel={title}
        accessibilityHint="Tap to view movie details"
        className={cn('w-full flex-row rounded-xl pr-4 gap-4', className)}
        {...rest}
      >
        {/* Left Section - Movie Poster */}
        <View className="relative">
          <StyledImage
            source={{ uri: posterUrl }}
            contentFit="cover"
            transition={200}
            accessibilityIgnoresInvertColors
            className={`${imageSizeClassName} rounded-lg`}
            testID="movie-card-poster"
            placeholder={{
              blurhash: BLUR_HASH,
            }}
            cachePolicy="memory-disk"
            recyclingKey={posterUrl}
          />
        </View>

        {/* Right Section - Movie Details */}
        <View
          className={cn(
            'flex-1 justify-end gap-3',
            `justify-${justifyContent}`,
          )}
        >
          {/* Title */}
          <Typo
            size="base"
            weight={imageSize === Size.SMALL ? 'medium' : 'semibold'}
            className="leading-5"
            testID="movie-card-title"
            accessibilityRole="text"
            accessibilityLabel={title}
          >
            {title}
          </Typo>

          {/* Booking Information (Showtime/Date, Price, Cinema) */}
          {hasBookingInfo ? (
            <View className="gap-1">
              {/* Price */}
              {price && (
                <Typo
                  size="sm"
                  weight="regular"
                  className={cn(
                    'text-white',
                    transactionType && WalletTransactionColor[transactionType],
                  )}
                  testID="movie-card-price"
                >
                  {formatIDR(price)}
                </Typo>
              )}

              {/* Showtime and Date */}
              {showtimeDateText && (
                <Typo
                  size="sm"
                  weight="regular"
                  className="text-white"
                  testID="movie-card-showtime"
                >
                  {showtimeDateText}
                </Typo>
              )}

              {/* Cinema Location */}
              {cinemaLocation && (
                <Typo
                  size="sm"
                  weight="light"
                  className="text-white"
                  testID="movie-card-cinema"
                >
                  {cinemaLocation}
                </Typo>
              )}

              {/* Cinema Location */}
              {cinemaName && (
                <Typo
                  size="sm"
                  weight="light"
                  className="text-white"
                  testID="movie-card-cinema"
                >
                  {cinemaName}
                </Typo>
              )}
            </View>
          ) : (
            <>
              {/* Rating */}
              {rating && (
                <View testID="movie-card-rating">
                  <Rating rating={rating} size={12} spacing={1} />
                </View>
              )}

              {/* Genres and Duration */}
              {(genresText || durationMinutes) && (
                <View className="gap-1">
                  {/* Genres */}
                  {genresText && (
                    <Typo
                      size="xs"
                      weight="light"
                      className="text-gradient-light"
                      testID="movie-card-genres"
                    >
                      {genresText}
                    </Typo>
                  )}

                  {/* Duration */}
                  {durationMinutes && (
                    <Typo
                      size="xs"
                      weight="light"
                      className="text-gradient-light"
                      testID="movie-card-duration"
                    >
                      {formatMovieDuration(durationMinutes)}
                    </Typo>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

MovieCard.displayName = 'MovieCard';

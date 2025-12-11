import { memo, useMemo } from 'react';
import { View } from 'react-native';

// Expo
import { Image } from 'expo-image';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { BLUR_HASH, IMAGE_SIZE_MAP, Size } from '@/constants';

// Components
import { Rating, Typo } from '@/components/common';

// Utils
import { formatMovieDuration, formatShowtimeDate } from '@/utils/formats';

interface MovieCardProps {
  title: string;
  posterUrl: string;
  durationMinutes: number;
  genre: string[];
  rating?: number;
  cinemaLocation?: string;
  showtime?: string;
  showDate?: string;
  price?: string;
  imageSize?: Size;
  className?: string;
}

const StyledImage = withUniwind(Image);

export const MovieCard = memo(
  ({
    title,
    posterUrl,
    durationMinutes,
    rating,
    genre,
    cinemaLocation,
    showtime,
    showDate,
    price,
    imageSize = Size.SMALL,
    className = '',
  }: MovieCardProps) => {
    const imageSizeClassName = useMemo(
      () => IMAGE_SIZE_MAP[imageSize as keyof typeof IMAGE_SIZE_MAP],
      [imageSize],
    );

    const genresText = useMemo(() => genre.join(', '), [genre]);

    const showtimeDateText = useMemo(
      () => formatShowtimeDate(showtime, showDate),
      [showtime, showDate],
    );

    const hasBookingInfo = useMemo(
      () => showtimeDateText || price || cinemaLocation,
      [showtimeDateText, price, cinemaLocation],
    );

    return (
      <View
        className={`w-full flex-row rounded-xl pr-4 gap-4 ${className}`}
        testID="movie-card"
        accessibilityLabel={title}
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
          />
        </View>

        {/* Right Section - Movie Details */}
        <View className="flex-1 justify-end my-1.5 gap-3">
          {/* Title */}
          <Typo
            size="base"
            weight="semibold"
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
                  className="text-green"
                  testID="movie-card-price"
                >
                  IDR: {price}
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
              {(genre.length > 0 || durationMinutes) && (
                <View className="gap-1">
                  {/* Genres */}
                  {genre.length > 0 && (
                    <Typo
                      size="xs"
                      weight="light"
                      className="text-gradient-white"
                      testID="movie-card-genres"
                    >
                      {genresText}
                    </Typo>
                  )}

                  {/* Duration */}
                  {durationMinutes > 0 && (
                    <Typo
                      size="xs"
                      weight="light"
                      className="text-gradient-white"
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
      </View>
    );
  },
);

MovieCard.displayName = 'MovieCard';

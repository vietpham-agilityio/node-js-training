import { Image } from 'expo-image';
import { memo } from 'react';
import {
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from 'react-native';
import { withUniwind } from 'uniwind';

// Constants
import { BLUR_HASH } from '@/constants';

// Types
import { Movie } from '@/features/booking/schemas/movie';

// Utils
import { cn } from '@/utils/cn';

// Components
import { Rating } from '@/components/Rating';
import { Typo } from '@/components/Typo';

type Variant = 'vertical' | 'horizontal';

interface MovieBannerProps extends Omit<TouchableOpacityProps, 'children'> {
  accessibilityLabel?: string;
  variant?: Variant;
  onPress?: () => void;
  movie: Movie;
}

const VARIANTS_MAP: Record<
  Variant,
  {
    size: string;
    rounded: string;
  }
> = {
  vertical: {
    size: 'w-[103] h-[147]',
    rounded: 'rounded-md',
  },
  horizontal: {
    size: 'w-[300] h-[200]',
    rounded: 'rounded-lg',
  },
};

const StyledImage = withUniwind(Image);

export const MovieBanner = memo(
  ({
    movie,
    variant = 'horizontal',
    onPress,
    accessibilityLabel,
    className,
    ...rest
  }: MovieBannerProps) => (
    <TouchableOpacity
      onPress={onPress}
      testID="movie-banner"
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel || `View details for ${movie.title}`
      }
      accessibilityHint="Tap to view movie details"
      className={cn(
        VARIANTS_MAP[variant].size,
        VARIANTS_MAP[variant].rounded,
        className,
      )}
      {...rest}
    >
      <View className="relative overflow-hidden">
        {/* Background Image */}
        <StyledImage
          source={{ uri: movie.posterUrl }}
          contentFit="cover"
          transition={200}
          placeholder={{
            blurhash: BLUR_HASH,
          }}
          accessibilityIgnoresInvertColors
          className={cn(
            VARIANTS_MAP[variant].size,
            VARIANTS_MAP[variant].rounded,
          )}
          cachePolicy="memory-disk"
          priority="high"
          recyclingKey={movie.posterUrl}
        />

        {/* Movie Information */}
        {variant === 'horizontal' && (
          <View
            className={cn(
              'absolute bottom-0 left-0 right-0 flex justify-end px-2.5 py-4 bg-gradient-to-t from-bg-quaternary/70 to-bg-quaternary/0',
              VARIANTS_MAP[variant].size,
              VARIANTS_MAP[variant].rounded,
            )}
          >
            {/* Title */}
            <Typo
              accessibilityRole="text"
              accessibilityLabel={movie.title}
              accessibilityHint="Movie title"
              weight="semibold"
              size="lg"
              className="text-white mb-2 line-clamp-2"
              testID="movie-banner-title"
            >
              {movie.title}
            </Typo>

            {/* Rating */}
            <Rating rating={movie.rating} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  ),
);

MovieBanner.displayName = 'MovieBanner';

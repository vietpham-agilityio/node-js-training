import { Image } from 'expo-image';
import { memo } from 'react';
import {
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from 'react-native';

// Constants
import { BLUR_HASH } from '@/constants';
import { Movie } from '@/types';
import { Rating } from '../Rating';
import { Typo } from '../Typo';

interface MovieBannerProps extends Omit<TouchableOpacityProps, 'children'> {
  movie: Movie;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const MovieBanner = memo(
  ({ movie, onPress, accessibilityLabel, ...rest }: MovieBannerProps) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        testID="movie-banner"
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel || `View details for ${movie.title}`
        }
        accessibilityHint="Double tap to view movie details"
        {...rest}
      >
        <View className="relative w-full aspect-video rounded-lg overflow-hidden ">
          {/* Background Image */}
          <Image
            source={{ uri: movie.posterUrl }}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: BLUR_HASH }}
            style={{
              width: '100%',
              height: '100%',
            }}
            accessibilityIgnoresInvertColors
          />

          {/* Movie Information */}
          <View className="absolute h-full bottom-0 left-0 right-0 flex justify-end px-2.5 py-4 bg-gradient-to-t from-bg-quaternary/70 to-bg-quaternary/0">
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
        </View>
      </TouchableOpacity>
    );
  },
);

MovieBanner.displayName = 'MovieBanner';

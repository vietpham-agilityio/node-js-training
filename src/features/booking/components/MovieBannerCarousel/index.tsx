import { memo, useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

// Expo
import { useRouter } from 'expo-router';

// Constants
import { ROUTES } from '@/constants';

// Types
import { Movie } from '@/features/booking/types/movie';

// Components
import { MovieBanner } from '../MovieBanner';

// Utils
import { isAndroid, isIOS } from '@/utils';

type Variant = 'horizontal' | 'vertical';

interface MovieBannerCarouselProps {
  variant?: Variant;
  movies: Movie[];
}

const VARIANTS_MAP: Record<
  Variant,
  {
    scale: number;
    offset: number;
    width: number;
    height: number;
  }
> = {
  vertical: {
    scale: 1,
    offset: -24,
    width: 103,
    height: 147,
  },
  horizontal: {
    scale: 0.9,
    offset: 35,
    width: 300,
    height: 220,
  },
};

export const MovieBannerCarousel = memo(
  ({ variant = 'horizontal', movies }: MovieBannerCarouselProps) => {
    const navigate = useRouter();

    const progress = useSharedValue<number>(0);
    const width = Dimensions.get('screen').width;

    // Generate unique key based on movies IDs
    // This forces carousel to remount when movies change
    const carouselKey = useMemo(() => {
      return movies.map(m => m.id).join('-');
    }, [movies]);

    if (movies.length === 0) {
      return null;
    }

    const variantLabel = variant === 'horizontal' ? 'horizontal' : 'vertical';

    const handleMoviePress = (movieId: string) => {
      navigate.push(ROUTES.MOVIE_DETAILS(movieId));
    };

    return (
      <View
        testID="movie-banner-carousel"
        accessibilityRole="none"
        accessibilityLabel={`Movie carousel with ${movies.length} movies, ${variantLabel} layout`}
        accessible
        {...(isAndroid() && {
          accessibilityLiveRegion: 'polite',
        })}
      >
        <Carousel
          key={carouselKey} // Forces remount when movies change
          autoPlayInterval={2000}
          data={movies}
          height={VARIANTS_MAP[variant].height}
          loop={movies.length > 3}
          pagingEnabled
          snapEnabled
          width={VARIANTS_MAP[variant].width}
          style={{
            width: width,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: VARIANTS_MAP[variant].scale,
            parallaxScrollingOffset: VARIANTS_MAP[variant].offset,
          }}
          onProgressChange={progress}
          renderItem={({ item, index }) => (
            <Animated.View
              key={item.id}
              testID={`movie-banner-slide-item-${item.id}`}
              className="flex-1"
              accessibilityRole="button"
              accessibilityLabel={`Movie ${index + 1} of ${movies.length}: ${item.title}`}
              accessibilityHint={`Swipe left or right to see other movies. Tap to view details.`}
              accessible
              {...(isAndroid() && {
                accessibilityLiveRegion: 'polite',
              })}
              {...(isIOS() && {
                accessibilityTraits: ['button'],
              })}
            >
              <MovieBanner
                movie={item}
                variant={variant}
                onPress={() => handleMoviePress(item.id)}
              />
            </Animated.View>
          )}
        />
      </View>
    );
  },
);

MovieBannerCarousel.displayName = 'MovieBannerCarousel';

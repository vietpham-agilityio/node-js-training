import { memo } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

// Utils
import { isAndroid, isIOS } from '@/utils';

// Components
import { MovieTrailer } from '../MovieTrailer';

interface MovieTrailerCarouselProps {
  trailers: string[];
}

export const MovieTrailerCarousel = memo(
  ({ trailers }: MovieTrailerCarouselProps) => {
    const progress = useSharedValue<number>(0);
    const width = Dimensions.get('screen').width;

    if (trailers.length === 0) {
      return null;
    }

    return (
      <View
        testID="movie-trailer-carousel"
        accessibilityRole="none"
        accessibilityLabel={`Movie carousel with ${trailers.length} movies`}
        accessible
        {...(isAndroid() && {
          accessibilityLiveRegion: 'polite',
        })}
      >
        <Carousel
          autoPlayInterval={2000}
          data={trailers}
          height={144}
          loop={false}
          pagingEnabled
          snapEnabled
          width={256}
          style={{
            width: width,
          }}
          onProgressChange={progress}
          renderItem={({ item, index }) => (
            <Animated.View
              key={item}
              testID={`movie-trailer-slide-item-${index}`}
              className="flex-1 pl-6"
              accessibilityRole="button"
              accessibilityLabel={`Movie ${index + 1} of ${trailers.length}: ${index}`}
              accessibilityHint={`Swipe left or right to see other movies. Tap to view details.`}
              accessible
              {...(isAndroid() && {
                accessibilityLiveRegion: 'polite',
              })}
              {...(isIOS() && {
                accessibilityTraits: ['button'],
              })}
            >
              <MovieTrailer />
            </Animated.View>
          )}
        />
      </View>
    );
  },
);

MovieTrailerCarousel.displayName = 'MovieTrailerCarousel';

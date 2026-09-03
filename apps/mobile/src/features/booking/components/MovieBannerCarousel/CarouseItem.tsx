import { memo, useCallback } from 'react';

// Types
import { Movie } from '@/features/booking/schemas/movie';

// Components
import { MovieBanner } from '../MovieBanner';

export type Variant = 'horizontal' | 'vertical';

interface CarouselItemProps {
  item: Movie;
  variant: Variant;
  handleMoviePress: (movieId: string) => void;
}

export const CarouselItem = memo(
  ({ item, variant, handleMoviePress }: CarouselItemProps) => {
    const onPress = useCallback(() => {
      handleMoviePress(item.id);
    }, [item.id, handleMoviePress]);

    return <MovieBanner movie={item} variant={variant} onPress={onPress} />;
  },
);

CarouselItem.displayName = 'CarouselItem';

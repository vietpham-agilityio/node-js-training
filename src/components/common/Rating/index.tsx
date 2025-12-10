import { StarIcon } from '@/icons';
import { memo } from 'react';
import { View } from 'react-native';
import { Typo } from '../Typo';

interface RatingProps {
  rating: number; // 0 to 5
  size?: number;
  spacing?: number;
}

export const Rating = memo(
  ({ rating, size = 12, spacing = 1 }: RatingProps) => {
    // Clamp rating between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, rating));

    // Calculate filled percentage for each star
    const stars = Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      if (clampedRating >= starValue) {
        return 1; // Fully filled
      } else if (clampedRating > index) {
        return clampedRating - index; // Partially filled
      }
      return 0; // Empty
    });

    return (
      <View
        testID="rating"
        className={`flex-row items-center gap-${spacing}`}
        accessibilityRole="image"
        accessibilityLabel={`Rating: ${rating.toFixed(1)} out of 5 stars`}
        accessible
      >
        {stars.map((filled, index) => (
          <View
            key={index}
            testID={`rating-star-${index + 1}`}
            accessible={false}
          >
            <StarIcon filled={filled} size={size} />
          </View>
        ))}

        <Typo
          testID="rating-value"
          size="4xs"
          weight="medium"
          className="text-white"
        >
          ({rating.toFixed(1)})
        </Typo>
      </View>
    );
  },
);

Rating.displayName = 'Rating';

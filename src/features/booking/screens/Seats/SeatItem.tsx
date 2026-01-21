import { memo, useCallback } from 'react';
import { View } from 'react-native';

// Components
import { SelectBox } from '@/features/booking/components/SelectBox';

// Constants
import { SEAT_STATUS } from '@/constants/status';

// Types
import { Seat } from '@/features/booking/schemas/cinema';

interface SeatItemProps {
  seat: Seat;
  onSeatPress: (seat: Seat) => void;
}

export const SeatItem = memo(({ seat, onSeatPress }: SeatItemProps) => {
  const handlePress = useCallback(() => {
    onSeatPress(seat);
  }, [seat, onSeatPress]);

  const isBooked = seat.status === SEAT_STATUS.BOOKED;
  const isSelected = seat.status === SEAT_STATUS.SELECTED;
  const hasAisleSpacing = seat.number === 5;

  const seatLabel = `Seat ${seat.id}`;
  const seatHint = isBooked
    ? 'This seat is already booked'
    : isSelected
      ? 'Tap to deselect this seat'
      : 'Tap to select this seat';

  return (
    <View
      className={
        hasAisleSpacing ? 'w-9 h-9 rounded-base ml-10' : 'w-9 h-9 rounded-base'
      }
    >
      <SelectBox
        testID={`seat-${seat.id}`}
        value={seat.id}
        isPrimary={isSelected}
        disabled={isBooked}
        onPress={handlePress}
        accessibilityLabel={seatLabel}
        accessibilityHint={seatHint}
        className="pt-1.5 pb-2.5 rounded-base"
      />
    </View>
  );
});

SeatItem.displayName = 'SeatItem';

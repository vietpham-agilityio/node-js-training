import { memo, useCallback } from 'react';
import { View } from 'react-native';

// Components
import { SelectBox } from '@/features/booking/components/SelectBox';

// Types
import { Seat, SeatStatus } from '@/features/booking/types/cinema';

interface SeatItemProps {
  seat: Seat;
  onSeatPress: (seat: Seat) => void;
}

export const SeatItem = memo(({ seat, onSeatPress }: SeatItemProps) => {
  const handlePress = useCallback(() => {
    onSeatPress(seat);
  }, [seat, onSeatPress]);

  const isBooked = seat.status === SeatStatus.BOOKED;
  const isSelected = seat.status === SeatStatus.SELECTED;
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

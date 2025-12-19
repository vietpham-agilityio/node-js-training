import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

// Expo
import { Href, router } from 'expo-router';

// Unwind
import { withUniwind } from 'uniwind';

// Components
import { Button } from '@/components/Button';
import { SelectBox } from '@/features/booking/components/SelectBox';
import { Typo } from '@/components/Typo';

// Constants
import { ROUTES, Size } from '@/constants';

// Icons
import { ScreenIcon } from '@/icons';

// Stores
import { useBookingStore } from '@/features/booking/store/booking';

// Utils
import {
  calculateTotalPrice,
  formatCurrency,
  generateSeats,
  groupSeatsByRow,
} from '@/utils';

// Types
import { Seat, SeatStatus } from '@/features/booking/types/cinema';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const STATUS_COLORS = [
  { color: 'bg-bg-quaternary', label: 'Available' },
  { color: 'bg-light-navy', label: 'Booked' },
  { color: 'bg-secondary', label: 'Your Seat' },
];

const SeatsScreen = () => {
  const {
    selectedMovie,
    selectedShowtime,
    selectedSeats,
    addSeat,
    removeSeat,
  } = useBookingStore(
    useShallow(state => ({
      selectedMovie: state.selectedMovie,
      selectedShowtime: state.selectedShowtime,
      selectedSeats: state.selectedSeats,
      addSeat: state.addSeat,
      removeSeat: state.removeSeat,
    })),
  );

  const [seats] = useState<Seat[]>(() => generateSeats());

  // Update seat status based on selected seats
  const seatsWithStatus = useMemo(() => {
    return seats.map(seat => {
      if (seat.status === SeatStatus.BOOKED) {
        return seat;
      }
      const isSelected = selectedSeats.includes(seat.id);
      return {
        ...seat,
        status: isSelected ? SeatStatus.SELECTED : SeatStatus.AVAILABLE,
      };
    });
  }, [seats, selectedSeats]);

  // Group seats by row
  const seatsByRow = groupSeatsByRow(seatsWithStatus);

  const totalPrice = calculateTotalPrice(
    selectedShowtime?.price || 0,
    selectedSeats.length,
  );

  const handleSeatPress = useCallback(
    (seat: Seat) => {
      if (seat.status === SeatStatus.BOOKED) {
        return;
      }

      if (seat.status === SeatStatus.SELECTED) {
        removeSeat(seat.id);
      } else {
        addSeat(seat.id);
      }
    },
    [addSeat, removeSeat],
  );

  const handleBookTicket = useCallback(() => {
    if (selectedSeats.length === 0 || !selectedShowtime) return;

    router.push(ROUTES.CHECKOUT as Href);
  }, [selectedSeats.length, selectedShowtime]);

  const renderSeat = useCallback(
    (seat: Seat) => {
      const isBooked = seat.status === SeatStatus.BOOKED;
      const isSelected = seat.status === SeatStatus.SELECTED;
      const hasAisleSpacing = seat.number === 5;

      return (
        <View
          key={seat.id}
          className={
            hasAisleSpacing
              ? 'w-9 h-9 rounded-base ml-10'
              : 'w-9 h-9 rounded-base'
          }
        >
          <SelectBox
            value={seat.id}
            isPrimary={isSelected}
            disabled={isBooked}
            onPress={() => handleSeatPress(seat)}
            className="pt-1.5 pb-2.5 rounded-base"
          />
        </View>
      );
    },
    [handleSeatPress],
  );

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      accessibilityLabel="Seat selection screen"
      className="flex-1 pl-6 bg-dark-blue"
    >
      <View className="flex-1 bg-dark-blue">
        {/* Movie Title and Cinema Name */}
        <View className="pr-6 pb-2">
          <Typo size="lg" weight="semibold">
            {selectedMovie?.title}
          </Typo>
          <Typo size="sm" weight="light" className="text-gradient-light">
            {selectedShowtime?.cinemaHall?.cinema?.name}
          </Typo>
        </View>

        {/* Status */}
        <View className="pr-6 mb-6">
          <View className="flex-row items-center justify-center gap-10">
            {STATUS_COLORS.map(({ color, label }) => (
              <View key={label} className="flex-row items-center gap-2">
                <View className={`w-5 h-5 rounded ${color}`} />
                <Typo size="sm">{label}</Typo>
              </View>
            ))}
          </View>
        </View>

        {/* Seat Grid */}
        <View className="mb-3">
          <ScrollView showsVerticalScrollIndicator={false}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24 }}
              nestedScrollEnabled
            >
              <View>
                {/* Seat Rows */}
                {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                  <View key={row} className="flex-row items-center mb-2">
                    {/* Seats */}
                    <View className="flex-row gap-2">
                      {rowSeats.map(seat => renderSeat(seat))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
        </View>

        {/* Screen Icon */}
        <View className="pr-6 mb-6 items-center">
          <Typo
            size="sm"
            weight="light"
            className="text-gradient-light text-center"
          >
            Screen
          </Typo>
          <ScreenIcon />
        </View>
      </View>

      {/* Bottom Section - Total Price and Book Ticket Button */}
      <View className="pr-6 flex-row justify-between">
        <View>
          <Typo size="sm" weight="light" className="text-gradient-light">
            Total Price ({selectedSeats.length} Ticket
            {selectedSeats.length !== 1 ? 's' : ''})
          </Typo>
          <Typo size="xl" weight="semibold">
            {formatCurrency(totalPrice)}
          </Typo>
        </View>
        <Button
          title="Book Ticket"
          onPress={handleBookTicket}
          disabled={selectedSeats.length === 0}
          size={Size.SMALL}
          className="rounded-lg"
          testID="book-ticket-button"
        />
      </View>
    </StyledSafeAreaView>
  );
};

export default SeatsScreen;

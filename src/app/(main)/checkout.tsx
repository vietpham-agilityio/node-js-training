import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

// Unwind
import { withUniwind } from 'uniwind';

// Components
import { Button, Divider, OrderDetailRow } from '@/components/common';
import { MovieCard } from '@/components/feature';

// Constants
import { Size } from '@/constants';

// Utils
import {
  calculateTotalPrice,
  formatCurrency,
  formatIDR,
} from '@/utils/formats';

// Mocks
import { MOCK_WALLET_BALANCE } from '@/mocks';

// Store
import { useBookingStore } from '@/stores';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);

const CheckoutScreen = () => {
  const { selectedMovie, selectedShowtime, selectedSeats, reservationId } =
    useBookingStore(
      useShallow(state => ({
        selectedMovie: state.selectedMovie,
        selectedShowtime: state.selectedShowtime,
        selectedSeats: state.selectedSeats,
        reservationId: state.reservationId,
      })),
    );

  // Calculate total price: price per ticket * number of seats
  const totalPrice = calculateTotalPrice(
    selectedShowtime?.price || 0,
    selectedSeats.length,
  );

  const orderRows = [
    {
      label: 'ID Order',
      value: reservationId || '209993282',
      testID: 'order-id',
    },
    {
      label: 'Cinema',
      value: selectedShowtime?.cinemaHall?.cinema?.name || '',
      testID: 'order-cinema',
    },
    {
      label: 'Date & Time',
      value: selectedShowtime?.showDate + ' ' + selectedShowtime?.showTime,
      testID: 'order-datetime',
    },
    {
      label: 'Seat Number',
      value: selectedSeats.join(', '),
      testID: 'order-seats',
    },
    {
      label: 'Price',
      value: `Rp ${selectedShowtime?.price.toLocaleString(
        'id-ID',
      )} x ${selectedSeats.length}`,
      testID: 'order-price',
    },
    {
      label: 'Total',
      value: formatCurrency(totalPrice),
      testID: 'order-total',
    },
  ];

  const handleCheckout = () => {
    // TODO: Replace with actual checkout logic
  };

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      accessibilityLabel="Checkout screen"
      className="flex-1 bg-dark-blue"
    >
      <StyledScrollView
        className="flex-1 bg-dark-blue"
        contentContainerClassName="px-6 flex-1 justify-between pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Movie Details Section */}
          <View className="mb-8">
            <MovieCard
              title={selectedMovie?.title || ''}
              posterUrl={selectedMovie?.posterUrl || ''}
              rating={selectedMovie?.rating}
              genre={selectedMovie?.genre}
              durationMinutes={selectedMovie?.durationMinutes}
            />
          </View>

          <Divider />

          {/* Order Details Section */}
          <View className="my-8 gap-4">
            {orderRows.map(row => (
              <OrderDetailRow
                key={row.testID}
                label={row.label}
                value={row.value}
                testID={row.testID}
              />
            ))}
          </View>

          <Divider />

          {/* Wallet Information */}
          <View className="my-6">
            <OrderDetailRow
              label="Your Wallet"
              value={formatIDR(MOCK_WALLET_BALANCE)}
              valueClassName="text-primary font-montserrat-semibold"
              testID="wallet-balance"
            />
          </View>
        </View>

        <Button
          title="Checkout"
          onPress={handleCheckout}
          testID="checkout-button"
          size={Size.LARGE}
        />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default CheckoutScreen;

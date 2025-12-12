import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Components
import { Button, Divider, OrderDetailRow } from '@/components/common';
import { MovieCard } from '@/components/feature';

// Constants
import { Size } from '@/constants';

// Utils
import { formatCurrency, formatIDR } from '@/utils/formats';

// Mocks
import { MOCK_MOVIE, MOCK_ORDER_DETAIL, MOCK_WALLET_BALANCE } from '@/mocks';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);

const CheckoutScreen = () => {
  // TODO: Replace with actual data from API
  const totalPrice =
    MOCK_ORDER_DETAIL.pricePerTicket * MOCK_ORDER_DETAIL.quantity;

  const orderRows = [
    {
      label: 'ID Order',
      value: MOCK_ORDER_DETAIL.idOrder,
      testID: 'order-id',
    },
    {
      label: 'Cinema',
      value: MOCK_ORDER_DETAIL.cinema,
      testID: 'order-cinema',
    },
    {
      label: 'Date & Time',
      value: MOCK_ORDER_DETAIL.dateTime,
      testID: 'order-datetime',
    },
    {
      label: 'Seat Number',
      value: MOCK_ORDER_DETAIL.seatNumber,
      testID: 'order-seats',
    },
    {
      label: 'Price',
      value: `Rp ${MOCK_ORDER_DETAIL.pricePerTicket.toLocaleString(
        'id-ID',
      )} x ${MOCK_ORDER_DETAIL.quantity}`,
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
      edges={['top', 'bottom']}
      accessibilityLabel="Checkout screen"
      className="flex-1 bg-dark-blue"
    >
      <StyledScrollView
        className="flex-1 bg-dark-blue"
        contentContainerClassName="px-6 flex-1 justify-between pt-24 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Movie Details Section */}
          <View className="mb-8">
            <MovieCard {...MOCK_MOVIE} />
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

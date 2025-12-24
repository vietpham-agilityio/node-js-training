import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { Size, UNACTIVE_MESSAGE } from '@/constants';

// Utils
import { formatDate, formatIDR, formatTime } from '@/utils/formats';

// Hooks
import { useTicket } from '@/features/ticket/hooks/useTickets';

// Types
import { TicketStatus } from '@/features/booking/types/booking';

// Components
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { MovieCard } from '@/components/MovieCard';
import { OrderDetailRow } from '@/components/OrderDetailRow';
import { Typo } from '@/components/Typo';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);

const TicketDetailScreen = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id || '';

  const {
    data: ticket,
    isLoading,
    isError,
    refetch: refetchTicket,
  } = useTicket(id);

  const ticketDetail = useMemo(() => {
    if (!ticket?.booking) return null;

    const { booking } = ticket;
    const { showtime } = booking;
    const { movie, cinemaHall, showTime, showDate } = showtime || {};
    const { cinema } = cinemaHall || {};

    if (!movie || !cinema) return null;

    return {
      movie,
      movieName: movie.title,
      cinemaName: cinema.name,
      seatNumber: ticket.seatNumber,
      seatsNumber: booking.seatNumbers,
      paid: formatIDR(booking.totalAmount),
      showTime: showTime,
      showDate: showDate,
      qrCode: ticket.qrCodeData,
      idOrder: booking.bookingNumber,
      status: ticket.status,
    };
  }, [ticket]);

  // Determine if QR should be shown
  const isActive = ticketDetail?.status === TicketStatus.ACTIVE;

  const orderRows = useMemo(
    () => [
      {
        label: 'Cinema',
        value: ticketDetail?.cinemaName || '',
        testID: 'cinema-name',
      },
      {
        label: 'Date & Time',
        value: `${formatDate(ticketDetail?.showDate || '')}, ${formatTime(
          ticketDetail?.showTime || '',
        )}`,
        testID: 'order-datetime',
      },
      {
        label: 'Seat Number',
        value: ticketDetail?.seatNumber || '',
        testID: 'order-seat',
      },
      {
        label: 'Seats Number',
        value: ticketDetail?.seatsNumber.join(', ') || '',
        testID: 'order-seats',
      },
      {
        label: 'Paid',
        value: ticketDetail?.paid || '',
        testID: 'paid',
      },
      {
        label: 'Status',
        value: ticketDetail?.status || '',
        testID: 'ticket-status',
      },
    ],
    [ticketDetail],
  );

  const unActiveMessage =
    UNACTIVE_MESSAGE[ticketDetail?.status as TicketStatus] || '';

  if (isLoading) {
    return (
      <StyledSafeAreaView
        edges={['bottom']}
        accessibilityLabel="Loading ticket"
        accessibilityHint="Loading ticket"
        className="flex-1 bg-bg-primary items-center justify-center"
      >
        <ActivityIndicator size="large" />
        <Typo className="text-text-secondary mt-4">Loading ticket...</Typo>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      accessibilityLabel="Ticket Detail screen"
      accessibilityHint="Ticket Detail screen"
      className="flex-1 bg-bg-primary"
    >
      <StyledScrollView
        contentContainerClassName="flex-1 px-6 justify-between"
        showsVerticalScrollIndicator={false}
      >
        {isError || !ticketDetail ? (
          <Button
            size={Size.EXTRA_SMALL}
            title="Retry"
            onPress={refetchTicket}
            accessibilityRole="button"
            accessibilityLabel="Retry loading ticket"
          />
        ) : (
          <View className="bg-deep-blue px-4 py-6 rounded-xl gap-3.5">
            {/* Movie Details Section */}
            <MovieCard justifyContent="center" {...ticketDetail?.movie!} />

            {/* Order Details Section */}
            <View className="gap-4 pt-6.5">
              {orderRows.map(row => (
                <OrderDetailRow
                  key={row.testID}
                  label={row.label}
                  value={row.value}
                  testID={row.testID}
                  valueClassName={
                    row.testID === 'ticket-status'
                      ? isActive
                        ? 'text-text-success'
                        : 'text-text-error'
                      : undefined
                  }
                />
              ))}
            </View>

            <Divider className="border-dashed" />

            {/* QR Code Section - Only show if active */}
            {isActive ? (
              <View className="items-center justify-center gap-2">
                <View className="w-[200] h-[200] items-center justify-center bg-white">
                  <QRCode
                    value={ticketDetail?.qrCode}
                    size={174}
                    color="black"
                    backgroundColor="white"
                  />
                </View>
                <View className="justify-between items-center">
                  <Typo
                    size="base"
                    weight="regular"
                    className="text-overlay-soft"
                  >
                    ID Order
                  </Typo>
                  <Typo size="base" weight="regular" className="text-center">
                    {ticketDetail?.idOrder}
                  </Typo>
                </View>
              </View>
            ) : (
              <Typo
                size="base"
                weight="regular"
                className="text-center italic text-overlay-soft"
              >
                {unActiveMessage}
              </Typo>
            )}
          </View>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default TicketDetailScreen;

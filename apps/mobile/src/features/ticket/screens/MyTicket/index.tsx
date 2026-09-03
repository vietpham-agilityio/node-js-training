import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import {
  ERROR_MESSAGES,
  MESSAGES,
  ROUTES,
  Size,
  TABS_FOOTER_HEIGHT,
  TICKET_TABS,
} from '@/constants';
import { BOOKING_STATUS } from '@/constants/status';

// Hooks
import { useTicketExpiration } from '@/features/ticket/hooks/useTicketExpiration';
import { useTicketsInfinite } from '@/features/ticket/hooks/useTickets';

// Types
import { Ticket } from '@/features/booking/schemas/booking';
// Components
import { Button } from '@/components/Button';
import { HorizontalCard } from '@/components/HorizontalCard';
import { HorizontalCardSkeleton } from '@/components/Skeletons/HorizontalCardSkeleton';
import { Tabs } from '@/components/Tabs';
import { Typo } from '@/components/Typo';
import { Tab } from '@/components/Tabs/TabItem';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const MyTicketScreen = () => {
  const [activeTab, setActiveTab] = useState(TICKET_TABS[0]?.id || '');

  // Hooks for ticket expiration
  const { checkExpiredTickets } = useTicketExpiration();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useTicketsInfinite();

  // Check for expired tickets when screen focuses
  useFocusEffect(
    useCallback(() => {
      checkExpiredTickets();
    }, [checkExpiredTickets]),
  );

  // Flatten paginated data
  const allTickets = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat();
  }, [data]);

  const isAllTickets = useMemo(
    () => activeTab === TICKET_TABS[0]?.id,
    [activeTab],
  );
  const isExpiredTickets = useMemo(
    () => activeTab === BOOKING_STATUS.EXPIRED,
    [activeTab],
  );
  const isActiveTickets = useMemo(
    () => activeTab === BOOKING_STATUS.ACTIVE,
    [activeTab],
  );

  // Filter tickets by status
  const filteredTickets = useMemo(() => {
    if (isAllTickets) return allTickets;

    if (isActiveTickets) {
      return allTickets.filter(
        ticket => ticket.status === BOOKING_STATUS.ACTIVE,
      );
    }

    if (isExpiredTickets) {
      return allTickets.filter(
        ticket =>
          ticket.status === BOOKING_STATUS.EXPIRED ||
          ticket.status === BOOKING_STATUS.CANCELLED ||
          ticket.status === BOOKING_STATUS.USED,
      );
    }

    return allTickets;
  }, [isAllTickets, allTickets, isActiveTickets, isExpiredTickets]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleBookNow = useCallback(() => {
    router.push(ROUTES.HOME);
  }, []);

  const handleTicketDetails = useCallback((ticketId: string) => {
    router.push(ROUTES.TICKET_DETAILS(ticketId));
  }, []);

  // Handle refresh action for expired tickets to check for updates
  const handleRefresh = useCallback(async () => {
    await checkExpiredTickets();
    refetch();
  }, [checkExpiredTickets, refetch]);

  const renderTicket = useCallback(
    ({ item }: { item: Ticket }) => {
      const { booking } = item;

      if (!booking) return null;

      const { showtime } = booking;
      const { movie, cinemaHall, showTime, showDate } = showtime || {};
      const { cinema } = cinemaHall || {};

      if (!movie || !cinema) return null;

      return (
        <HorizontalCard
          title={movie.title}
          posterUrl={movie.posterUrl}
          showtime={showTime}
          showDate={showDate}
          cinemaName={cinema.name}
          justifyContent="center"
          onPress={() => handleTicketDetails(item.id)}
        />
      );
    },
    [handleTicketDetails],
  );

  const keyExtractor = useCallback((item: Ticket) => item.id, []);

  const getItemType = useCallback((item: Ticket) => {
    return item.status || 'default';
  }, []);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View
        className="py-4 items-center"
        accessibilityRole="progressbar"
        accessibilityLabel="Loading more tickets"
      >
        <ActivityIndicator size="small" />
        <Typo size="xs" className="text-text-secondary mt-2">
          Loading more tickets...
        </Typo>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View className="gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <HorizontalCardSkeleton
              key={`skeleton-${index}`}
              imageSize={Size.SMALL}
            />
          ))}
        </View>
      );
    }

    if (isError) {
      return (
        <View
          className="flex-1 items-center justify-center py-16 px-6 gap-4"
          accessibilityRole="alert"
        >
          <Typo
            size="base"
            className="text-text-error text-center"
            weight="semibold"
          >
            {ERROR_MESSAGES.TICKET_NETWORK_ERROR}
          </Typo>
          <Typo size="sm" className="text-text-secondary text-center mt-2">
            {error?.message || 'Please try again'}
          </Typo>
          <Button
            size={Size.EXTRA_SMALL}
            title="Retry"
            onPress={refetch}
            accessibilityRole="button"
            accessibilityLabel="Retry loading tickets"
          />
        </View>
      );
    }

    return (
      <View
        className="flex-1 items-center justify-center py-16 px-6"
        accessibilityRole="text"
      >
        <Typo
          size="xl"
          weight="semibold"
          className="text-text-secondary text-center mb-2"
        >
          {isAllTickets
            ? 'No tickets yet'
            : isActiveTickets
              ? 'No active tickets'
              : 'No expired tickets'}
        </Typo>
        <Typo size="sm" className="text-text-secondary text-center mb-6">
          {isAllTickets
            ? MESSAGES.NO_TICKETS
            : isActiveTickets
              ? MESSAGES.NO_ACTIVE_TICKETS
              : MESSAGES.NO_EXPIRED_TICKETS}
        </Typo>
        {isAllTickets && (
          <Button
            isPrimary={false}
            size={Size.EXTRA_SMALL}
            title="Book Now"
            onPress={handleBookNow}
            accessibilityRole="button"
            accessibilityLabel="Book a movie ticket"
          />
        )}
      </View>
    );
  }, [
    isLoading,
    isError,
    isAllTickets,
    isActiveTickets,
    handleBookNow,
    error?.message,
    refetch,
  ]);

  return (
    <StyledSafeAreaView
      edges={[]}
      accessibilityLabel="My Ticket screen"
      accessibilityHint="My Ticket screen"
      className="flex-1 bg-bg-primary"
    >
      <View className="px-6 gap-6 mb-6">
        <Tabs
          variant="tertiary"
          tabs={TICKET_TABS as Tab[]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <View className="border-b border-white/80" />
      </View>

      <FlashList
        key={activeTab}
        data={filteredTickets}
        renderItem={renderTicket}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: TABS_FOOTER_HEIGHT,
        }}
        ItemSeparatorComponent={() => <View className="h-6" />}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            accessibilityLabel="Pull to refresh tickets"
          />
        }
        accessibilityLabel={`Tickets list showing ${filteredTickets.length} ${activeTab} tickets`}
      />
    </StyledSafeAreaView>
  );
};

export default MyTicketScreen;

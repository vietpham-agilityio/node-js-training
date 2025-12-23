import { FlashList } from '@shopify/flash-list';
import { Href, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { ROUTES, Size, TABS_FOOTER_HEIGHT } from '@/constants';

// Hooks
import { useProfile } from '@/features/setting/hooks/useProfile';
import {
  useTransactionsInfinite,
  useWallet,
} from '@/features/wallet/hooks/useWallet';

// Types
import { WalletTransaction } from '@/features/wallet/types/wallet';

// Components
import { Button } from '@/components/Button';
import { MovieCard } from '@/components/MovieCard';
import { Typo } from '@/components/Typo';
import { WalletCard } from '@/features/wallet/components/WalletCard';

// Icons
import { Transaction } from '@/features/wallet/components/Transaction';
import { TopUpIcon } from '@/icons/TopUpIcon';

const StyledSafeAreaView = withUniwind(SafeAreaView);

const MyWalletScreen = () => {
  const router = useRouter();

  const {
    data: wallet,
    isLoading: isLoadingWallet,
    isError: isWalletError,
    refetch: refetchWallet,
  } = useWallet();

  // Fetch user profile for card name
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  const {
    data,
    isLoading: isLoadingTransactions,
    isError: isTransactionsError,
    error: transactionsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchTransactions,
    isRefetching,
  } = useTransactionsInfinite();

  // Flatten paginated data
  const allTransactions = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat();
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchWallet(), refetchTransactions()]);
  }, [refetchWallet, refetchTransactions]);

  const handleTopUp = useCallback(() => {
    router.push(ROUTES.TOP_UP as Href);
  }, [router]);

  const renderTransaction = useCallback(
    ({ item }: { item: WalletTransaction }) => {
      const { booking } = item;

      if (!booking)
        return (
          <Transaction
            description={item.description}
            createdAt={item.createdAt}
            amount={item.amount}
            transactionType={item.transactionType}
          />
        );

      const { showtime } = booking;
      const { movie, cinemaHall, showTime, showDate } = showtime || {};
      const { cinema } = cinemaHall || {};

      if (!movie || !cinema) return null;

      return (
        <MovieCard
          title={movie.title}
          posterUrl={movie.posterUrl}
          showtime={showTime}
          showDate={showDate}
          cinemaName={cinema.name}
          transactionType={item.transactionType}
          price={item.amount.toString()}
          justifyContent="center"
        />
      );
    },
    [],
  );

  const keyExtractor = useCallback((item: WalletTransaction) => item.id, []);

  const getItemType = useCallback(
    (item: WalletTransaction) => item.transactionType || 'default',
    [],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View
        className="py-4 items-center"
        accessibilityRole="progressbar"
        accessibilityLabel="Loading more transactions"
      >
        <ActivityIndicator size="small" />
        <Typo size="xs" className="text-text-secondary mt-2">
          Loading more transactions...
        </Typo>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoadingTransactions) return null;

    if (isTransactionsError) {
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
            Failed to load transactions
          </Typo>
          <Typo size="sm" className="text-text-secondary text-center">
            {transactionsError?.message || 'Please try again'}
          </Typo>

          <Button
            size={Size.EXTRA_SMALL}
            title="Retry"
            onPress={refetchTransactions}
            accessibilityRole="button"
            accessibilityLabel="Retry loading transactions"
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
          No transactions yet
        </Typo>
        <Typo size="sm" className="text-gradient-medium text-center mb-6">
          Top up your wallet to start booking tickets
        </Typo>
        <Button
          isPrimary={false}
          size={Size.EXTRA_SMALL}
          title="Book Now"
          onPress={handleTopUp}
          accessibilityRole="button"
          accessibilityLabel="Book a movie ticket"
        />
      </View>
    );
  }, [
    isLoadingTransactions,
    isTransactionsError,
    transactionsError,
    refetchTransactions,
    handleTopUp,
  ]);

  const ListHeader = useCallback(
    () => (
      <View className="pb-7 gap-7">
        {isWalletError ? (
          <Button
            size={Size.EXTRA_SMALL}
            title="Retry"
            onPress={refetchWallet}
            accessibilityRole="button"
            accessibilityLabel="Retry loading tickets"
          />
        ) : wallet ? (
          <WalletCard
            balance={wallet.balance}
            currency={wallet.currency}
            cardNumber={wallet.cardNumber}
            cardName={profile?.fullName || 'User'}
            accessibilityLabel={`Wallet balance ${wallet.balance} ${wallet.currency}`}
            onPress={handleTopUp}
          />
        ) : null}

        <Typo size="lg" weight="medium" accessibilityRole="header">
          Recent Transactions
        </Typo>
      </View>
    ),
    [isWalletError, refetchWallet, wallet, profile?.fullName, handleTopUp],
  );

  if (isLoadingProfile || isLoadingWallet || isLoadingTransactions) {
    return (
      <StyledSafeAreaView
        edges={[]}
        className="flex-1 bg-bg-primary items-center justify-center"
        accessibilityLabel="Loading wallet"
      >
        <ActivityIndicator size="large" />
        <Typo className="text-text-secondary mt-4">Loading wallet...</Typo>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView
      edges={[]}
      accessibilityLabel="Wallet screen"
      accessibilityHint="Wallet screen"
      className="flex-1 bg-bg-primary"
    >
      <FlashList
        data={allTransactions}
        renderItem={renderTransaction}
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
        ListHeaderComponent={ListHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            accessibilityLabel="Pull to refresh wallet and transactions"
          />
        }
        accessibilityLabel={`Transactions list showing ${allTransactions.length} transactions`}
      />

      {/* Floating Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          onPress={handleTopUp}
          className="w-fit justify-center items-center p-2.5 rounded-full bg-gradient-to-r from-gradient-blue-start to-gradient-blue-end"
          accessibilityRole="button"
          accessibilityLabel="Top up wallet"
          accessibilityHint="Navigate to top up wallet screen"
        >
          <TopUpIcon />
        </TouchableOpacity>
      </View>
    </StyledSafeAreaView>
  );
};

export default MyWalletScreen;

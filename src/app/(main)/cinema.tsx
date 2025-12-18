import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

// Expo
import { router, useLocalSearchParams } from 'expo-router';

// Unwind
import { useResolveClassNames } from 'uniwind';

// Components
import { SelectBox, Typo } from '@/components/common';
import { LocationDropdown } from '@/components/feature';

// Constants
import { ERROR_MESSAGES, ROUTES } from '@/constants';

// Hooks
import { useShowtimes } from '@/hooks';

// Icons
import { ArrowRightIcon } from '@/icons';

// Utils
import { formatShowtimes, formatTime, getDayOfWeekLabels } from '@/utils';

// Store
import { useBookingStore, useHeaderStore, useToastStore } from '@/stores';

// Types
import { CinemaWithShowtimes, Showtime } from '@/types';

const CinemaScreen = () => {
  const params = useLocalSearchParams<{
    movieTitle: string;
    movieId?: string;
  }>();
  const movieId = params.movieId || '';

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<{
    cinemaId: string;
    showtimeId: string;
  } | null>(null);

  const showToast = useToastStore(state => state.showError);
  const setShowtime = useBookingStore(state => state.setShowtime);
  const clearHeaderTitle = useHeaderStore(state => state.clearTitle);

  const iconColorConfig = useResolveClassNames('text-white');

  const DATE_LABELS = getDayOfWeekLabels();

  // Use selected date or default to today's date
  const showDate = selectedDate || DATE_LABELS[0]?.id || '';

  const {
    data: showtimesData,
    isLoading,
    isError,
    error: showtimesError,
  } = useShowtimes(movieId, showDate);

  const cinemasWithShowtimes = useMemo(() => {
    if (!showtimesData || showtimesData.length === 0) return [];

    return formatShowtimes(showtimesData, showDate);
  }, [showtimesData, showDate]);

  const isDisabled = useMemo(
    () => selectedShowtime && selectedDate,
    [selectedDate, selectedShowtime],
  );

  useEffect(() => {
    if (isError) {
      showToast(showtimesError?.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
    }
  }, [showtimesError, showToast, isError]);

  const handleNavigateToSeatSelection = useCallback(() => {
    if (!selectedShowtime) return;

    clearHeaderTitle();
    router.push(ROUTES.SEATS);
  }, [selectedShowtime, clearHeaderTitle]);

  const handleDateSelect = useCallback((dateId: string) => {
    setSelectedDate(dateId);
    setSelectedShowtime(null);
  }, []);

  const handleShowtimeSelect = useCallback(
    (cinemaId: string, showtimeId: string) => {
      const showtime = cinemasWithShowtimes
        .find(cinema => cinema.cinema.id === cinemaId)
        ?.showtimes.find(showtime => showtime.id === showtimeId);
      setSelectedShowtime({ cinemaId, showtimeId });

      if (showtime) {
        setShowtime(showtime);
      }
    },
    [cinemasWithShowtimes, setShowtime],
  );

  const handleLocationChange = useCallback((value: string) => {
    setSelectedLocation(value);
  }, []);

  const keyShowtimeExtractor = useCallback((item: Showtime) => item.id, []);
  const keyExtractor = useCallback(
    (item: CinemaWithShowtimes) => item.cinema.id,
    [],
  );

  const HorizontalItemSeparator = useCallback(
    () => <View className="w-4" />,
    [],
  );

  const ItemSeparator = useCallback(() => <View className="h-6" />, []);

  const ListHeaderComponent = useCallback(
    () => (
      <View className="pl-6">
        {/* Location Selection */}
        <View className="mb-6 mr-6">
          <LocationDropdown
            value={selectedLocation}
            onChange={handleLocationChange}
            containerClassName="w-full"
          />
        </View>

        {/* Date Selection */}
        <View className="mb-6">
          <Typo size="xl" weight="medium" className="mb-4">
            Choose Date
          </Typo>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingRight: 24 }}
          >
            {DATE_LABELS.map(({ id, label }) => {
              const isSelected = selectedDate === id;
              const handleSelectDate = () => handleDateSelect(id);

              return (
                <View key={id} className="w-17.5">
                  <SelectBox
                    value={label}
                    isPrimary={isSelected}
                    onPress={handleSelectDate}
                    className="py-5 px-3"
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    ),
    [
      selectedLocation,
      selectedDate,
      handleLocationChange,
      handleDateSelect,
      DATE_LABELS,
    ],
  );

  const renderShowtime = useCallback(
    ({
      item: showtime,
      cinemaId,
      cinemaName,
    }: {
      item: { id: string; showTime: string };
      cinemaId: string;
      cinemaName: string;
    }) => {
      const isSelected =
        selectedShowtime?.cinemaId === cinemaId &&
        selectedShowtime?.showtimeId === showtime.id;

      const formattedTime = formatTime(showtime.showTime);

      return (
        <SelectBox
          value={formattedTime}
          isPrimary={isSelected}
          accessibilityLabel={`Select showtime ${formattedTime} at ${cinemaName}`}
          className="py-3 px-4.5"
          onPress={() => handleShowtimeSelect(cinemaId, showtime.id)}
        />
      );
    },
    [selectedShowtime, handleShowtimeSelect],
  );

  const renderCinema = useCallback(
    ({ item }: { item: CinemaWithShowtimes }) => {
      const { cinema, showtimes } = item;

      return (
        <View className="gap-6 pl-6">
          <Typo size="xl" weight="medium">
            {cinema.name}
          </Typo>
          <FlashList
            data={showtimes}
            renderItem={({ item: showtime }) =>
              renderShowtime({
                item: showtime,
                cinemaId: cinema.id,
                cinemaName: cinema.name,
              })
            }
            horizontal
            keyExtractor={keyShowtimeExtractor}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
            ItemSeparatorComponent={HorizontalItemSeparator}
          />
        </View>
      );
    },
    [renderShowtime, keyShowtimeExtractor, HorizontalItemSeparator],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View
          className="flex-1 items-center justify-center py-16"
          accessibilityRole="progressbar"
        >
          <ActivityIndicator size="large" />
          <Typo size="sm" className="text-text-secondary mt-4">
            Loading showtimes...
          </Typo>
        </View>
      );
    }

    if (cinemasWithShowtimes.length === 0) {
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
            No showtimes available
          </Typo>
          <Typo size="sm" className="text-text-secondary text-center">
            Please select a different date
          </Typo>
        </View>
      );
    }

    return null;
  }, [isLoading, cinemasWithShowtimes.length]);

  return (
    <View className="flex-1 bg-dark-blue">
      <FlashList
        data={cinemasWithShowtimes}
        renderItem={renderCinema}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />

      {/* Circular Navigation Button */}
      {!isLoading && !isError && cinemasWithShowtimes.length > 0 && (
        <View className="absolute bottom-6 left-0 right-0 items-center">
          <TouchableOpacity
            onPress={handleNavigateToSeatSelection}
            disabled={!isDisabled}
            accessibilityRole="button"
            accessibilityLabel="Continue to seat selection"
            className={`w-14 h-14 rounded-full items-center justify-center ${
              isDisabled
                ? 'bg-linear-to-r from-secondary to-primary'
                : 'bg-bg-quaternary'
            }`}
          >
            <ArrowRightIcon color={iconColorConfig.color} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CinemaScreen;

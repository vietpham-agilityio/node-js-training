import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

// Expo
import { router, useLocalSearchParams } from 'expo-router';

// Unwind
import { useResolveClassNames } from 'uniwind';

// Components
import { SelectBox, Typo } from '@/components/common';
import { LocationDropdown } from '@/components/feature';

// Constants
import { ROUTES } from '@/constants';

// Icons
import { ArrowRightIcon } from '@/icons';

// Utils
import { getDayOfWeekLabels } from '@/utils';

// Mock data
import {
  CinemaWithShowtimes,
  generateMockCinemasWithShowtimes,
  MOCK_CINEMAS,
} from '@/mocks/showtime';

// Stpre
import { useBookingStore, useHeaderStore } from '@/stores';

// Types
import { Showtime } from '@/types';

const CinemaScreen = () => {
  const params = useLocalSearchParams<{
    movieTitle: string;
    movieId?: string;
  }>();
  const movieId = params.movieId || '';

  const setShowtime = useBookingStore(state => state.setShowtime);
  const clearHeaderTitle = useHeaderStore(state => state.clearTitle);

  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<{
    cinemaId: string;
    showtimeId: string;
  } | null>(null);

  const iconColorConfig = useResolveClassNames('text-white');

  const DATE_LABELS = getDayOfWeekLabels();

  // Use selected date or default to today's date
  const showDate = selectedDate || DATE_LABELS[0]?.id || '';

  // TODO: Will replace will data from API
  const CINEMA_WITH_SHOWTIME_MOCK =
    showDate && movieId
      ? generateMockCinemasWithShowtimes(movieId, showDate)
      : MOCK_CINEMAS;

  const isDisabled = useMemo(
    () => selectedShowtime && selectedDate,
    [selectedDate, selectedShowtime],
  );

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
      const showtime = CINEMA_WITH_SHOWTIME_MOCK.find(
        cinema => cinema.cinema.id === cinemaId,
      )?.showtimes.find(showtime => showtime.id === showtimeId);
      setSelectedShowtime({ cinemaId, showtimeId });

      if (showtime) {
        setShowtime(showtime);
      }
    },
    [CINEMA_WITH_SHOWTIME_MOCK, setShowtime],
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

      return (
        <SelectBox
          value={showtime.showTime}
          isPrimary={isSelected}
          accessibilityLabel={`Select showtime ${showtime.showTime} at ${cinemaName}`}
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

  return (
    <View className="flex-1 bg-dark-blue">
      <FlashList
        data={CINEMA_WITH_SHOWTIME_MOCK}
        renderItem={renderCinema}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
      />

      {/* Circular Navigation Button */}
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
    </View>
  );
};

export default CinemaScreen;

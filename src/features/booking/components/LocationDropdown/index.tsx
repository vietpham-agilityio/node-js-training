import { FlashList } from '@shopify/flash-list';
import { memo, useCallback, useMemo, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

// SDKs
import {
  getCurrentPositionAsync,
  LocationGeocodedAddress,
  requestForegroundPermissionsAsync,
  reverseGeocodeAsync,
} from 'expo-location';

// Uniwind
import { useResolveClassNames } from 'uniwind';

// Icons
import { ChevronDownIcon } from '@/icons/ChevronDownIcon';
import { LocationIcon } from '@/icons/LocationIcon';

// Components
import { Typo } from '@/components/Typo';

// Utils
import { cn } from '@/utils/cn';

// Constants
import { ERROR_MESSAGES } from '@/constants';

export interface LocationOption {
  label: string;
  value: string;
}

export interface LocationDropdownProps {
  value?: string;
  testID?: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  disabled?: boolean;
}

export const LocationDropdown = memo(
  ({
    value = '',
    testID,
    onChange,
    containerClassName,
    disabled = false,
  }: LocationDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
    const [location, setLocation] = useState<LocationGeocodedAddress | null>(
      null,
    );

    const iconColorConfig = useResolveClassNames('text-white');

    const locationOptions = useMemo(() => {
      return location?.city
        ? [
            {
              label: location.city,
              value: location.city,
            },
          ]
        : [
            {
              label: location?.region || 'Unknown Location',
              value: location?.region || 'Unknown Location',
            },
          ];
    }, [location]);

    const requestLocationPermission = useCallback(async () => {
      let { status } = await requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(ERROR_MESSAGES.LOCATION_PERMISSION_DENIED);
        return null;
      }

      let currentLocation = await getCurrentPositionAsync({});

      const address = await reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setLocation(address[0]);
      setHasRequestedPermission(true);

      if (address[0]?.city || address[0]?.region) {
        onChange(address[0].city || address[0].region!);
      }

      return status;
    }, [onChange]);

    const handleOpen = useCallback(async () => {
      if (disabled) return;

      if (hasRequestedPermission && location?.city) {
        setIsOpen(true);
        setIsFocused(true);
        return;
      }

      const status = await requestLocationPermission();
      if (status !== 'granted') return;

      setIsOpen(true);
      setIsFocused(true);
    }, [disabled, requestLocationPermission, hasRequestedPermission, location]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      setIsFocused(false);
    }, []);

    const handleSelect = useCallback(
      (selectedValue: string) => {
        onChange(selectedValue);
        handleClose();
      },
      [onChange, handleClose],
    );

    const selectedOption = useMemo(() => {
      if (!value || value.trim() === '') return null;
      return locationOptions.find(option => option.value === value) || null;
    }, [locationOptions, value]);

    const borderColor = useMemo(
      () =>
        errorMsg ? 'border-red' : isFocused ? 'border-primary' : 'border-white',
      [errorMsg, isFocused],
    );

    // Show the selected value or placeholder
    const displayText =
      selectedOption?.label || value || 'Select Your Location';

    const renderItem = useCallback(
      ({ item }: { item: LocationOption }) => {
        const isSelected = value === item.value;

        return (
          <TouchableOpacity
            onPress={() => handleSelect(item.value)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${item.label}`}
            testID={`${testID}-option-${item.value}`}
            className={cn(
              'px-6 py-4 flex-row items-center justify-between',
              isSelected && 'bg-white/5',
            )}
          >
            <Typo
              size="base"
              weight={isSelected ? 'semibold' : 'regular'}
              className={isSelected ? 'text-primary' : 'text-white'}
            >
              {item.label}
            </Typo>
            {isSelected && <View className="w-2 h-2 rounded-full bg-green" />}
          </TouchableOpacity>
        );
      },
      [handleSelect, testID, value],
    );

    return (
      <View className={cn('w-full', containerClassName)} testID={testID}>
        <View className="relative">
          {/* Dropdown Button */}
          <TouchableOpacity
            onPress={handleOpen}
            disabled={disabled}
            activeOpacity={1}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Location selector${selectedOption ? `, currently selected: ${selectedOption.label}` : ', no location selected'}`}
            accessibilityHint="Tap to open location selection menu"
            accessibilityState={{ disabled }}
            testID={`${testID}-button`}
            className={cn(
              'w-full h-12 px-4 flex-row items-center justify-between border rounded-base',
              borderColor,
              disabled && 'opacity-50',
            )}
          >
            <View className="flex-row items-center flex-1 gap-3">
              <LocationIcon color={iconColorConfig.color} />
              <Typo size="sm" weight="regular">
                {displayText}
              </Typo>
            </View>
            <ChevronDownIcon color={iconColorConfig.color} />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {errorMsg && (
          <Text
            accessibilityRole="alert"
            accessibilityLabel={errorMsg}
            className="text-red text-xs mt-1 ml-4"
            testID={`${testID}-error`}
          >
            {errorMsg}
          </Text>
        )}

        {/* Options Modal */}
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
          testID={`${testID}-modal`}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-end"
            activeOpacity={1}
            onPress={handleClose}
            testID={`${testID}-modal-backdrop`}
          >
            <View className="bg-dark-blue rounded-t-3xl">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
                <Typo size="lg" weight="semibold" className="text-white">
                  Location
                </Typo>
                <TouchableOpacity
                  onPress={handleClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close dropdown"
                  testID={`${testID}-modal-close`}
                >
                  <Typo size="base" weight="medium" className="text-primary">
                    Done
                  </Typo>
                </TouchableOpacity>
              </View>

              {/* Options List */}
              <View className="h-40">
                <FlashList
                  data={locationOptions}
                  keyExtractor={item => item.value}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  },
);

LocationDropdown.displayName = 'LocationDropdown';

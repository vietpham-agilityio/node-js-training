import { memo } from 'react';
import {
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';

// Icons
import { SearchIcon } from '@/icons/SearchIcon';

// Uniwind
import { useResolveClassNames } from 'uniwind';

// Utils
import { cn } from '@/utils/cn';
import { isAndroid } from '@/utils/platform';

export interface SearchInputProps extends Omit<TextInputProps, 'placeholder'> {
  testID?: string;
  placeholder?: string;
  containerClassName?: string;
}

export const SearchInput = memo(
  ({
    value = '',
    placeholder = 'Search movies',
    testID,
    className,
    containerClassName,
    onPress,
    ...rest
  }: SearchInputProps) => {
    const themes = useResolveClassNames('text-white');

    const InputWrapper = isAndroid() ? Pressable : View;

    return (
      <View className={cn(`w-full`, containerClassName)} testID={testID}>
        <InputWrapper
          onPress={onPress}
          className="relative flex-row items-center"
          disabled={!onPress}
        >
          {/* Text Input */}
          <TextInput
            accessible
            accessibilityLabel={placeholder}
            accessibilityRole="text"
            allowFontScaling={false}
            value={value}
            testID={`${testID}-input`}
            className={cn(
              'w-full h-12 pl-14 pr-4 pb-1 bg-dark-navy text-white text-sm border rounded-xl',
              isAndroid() && 'pb-2',
              className,
            )}
            placeholder={placeholder}
            placeholderTextColor={themes.color}
            {...(!isAndroid() && { onPress })}
            {...rest}
          />

          {/* Search Icon */}
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Search"
            className="absolute left-5"
            onPress={onPress}
          >
            <SearchIcon color={themes.color} />
          </TouchableOpacity>
        </InputWrapper>
      </View>
    );
  },
);

SearchInput.displayName = 'SearchInput';

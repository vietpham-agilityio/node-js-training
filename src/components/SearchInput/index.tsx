import { memo } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

// Icons
import { SearchIcon } from '@/icons';

// Uniwind
import { useResolveClassNames } from 'uniwind';

// Utils
import { cn, isAndroid } from '@/utils';

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
    ...rest
  }: SearchInputProps) => {
    const themes = useResolveClassNames('text-white');

    return (
      <View className={cn(`w-full`, containerClassName)} testID={testID}>
        <View className="relative flex-row items-center">
          {/* Search Icon */}
          <View
            accessible
            accessibilityRole="button"
            accessibilityLabel="Search"
            className="absolute left-5 z-1"
          >
            <SearchIcon color={themes.color} />
          </View>

          {/* Text Input */}
          <TextInput
            accessible
            accessibilityLabel={placeholder}
            value={value}
            testID={`${testID}-input`}
            className={cn(
              'w-full h-12 pl-14 pr-4 pb-1 bg-dark-navy text-white text-sm border rounded-xl',
              isAndroid() && 'pb-2',
              className,
            )}
            placeholder={placeholder}
            placeholderTextColor={themes.color}
            {...rest}
          />
        </View>
      </View>
    );
  },
);

SearchInput.displayName = 'SearchInput';

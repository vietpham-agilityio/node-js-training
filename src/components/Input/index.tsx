import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type NativeSyntheticEvent,
  type TargetedEvent,
  type TextInputProps,
} from 'react-native';

// Icons
import { EyeIcon, EyeOffIcon } from '@/icons';

// Utils
import { cn, isAndroid } from '@/utils';
import { Typo } from '../Typo';

export interface InputProps extends Omit<TextInputProps, 'placeholder'> {
  label: string;
  error?: string;
  testID?: string;
  onChangeText: (text: string) => void;
  containerClassName?: string;
}

export const Input = memo(
  forwardRef<TextInput, InputProps>(
    (
      {
        label,
        value = '',
        error,
        testID,
        onChangeText,
        onFocus,
        onBlur,
        secureTextEntry,
        containerClassName,
        ...rest
      },
      ref,
    ) => {
      const inputRef = useRef<TextInput>(null);
      const [isFocused, setIsFocused] = useState(false);

      // animated value for the label position and size
      const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));
      const [isPasswordVisible, setIsPasswordVisible] = useState(false);

      const handleFocus = useCallback(
        (e: NativeSyntheticEvent<TargetedEvent>) => {
          setIsFocused(true);
          // if the value is not empty, animate the label position and size to 1
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start();
          onFocus?.(e);
        },
        [animatedValue, onFocus],
      );

      const handleLabelPress = useCallback(() => {
        // Focus the input when label is clicked
        inputRef.current?.focus();
      }, [inputRef]);

      const handleBlur = useCallback(
        (e: NativeSyntheticEvent<TargetedEvent>) => {
          setIsFocused(false);
          // if the value is empty, animate the label position and size to 0
          if (!value || value.length === 0) {
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start();
          }
          onBlur?.(e);
        },
        [animatedValue, onBlur, value],
      );

      const togglePasswordVisibility = useCallback(() => {
        setIsPasswordVisible(prev => !prev);
      }, []);

      useEffect(() => {
        const hasValue = value && value.length > 0;
        const shouldBeAtTop = hasValue || isFocused;

        Animated.timing(animatedValue, {
          toValue: shouldBeAtTop ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }, [value, isFocused, animatedValue]);

      // Animated label position and size based on the value
      const labelTop = useMemo(
        () =>
          animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, -10], // animate the label position to 16 when the value is 0 and -10 when the value is 1
            ...(isAndroid() && { outputRange: [14, -10] }),
          }),
        [animatedValue],
      );

      // Animated label font size based on the value
      const labelFontSize = useMemo(
        () =>
          animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 14], // keep the font size the same regardless of the value
          }),
        [animatedValue],
      );

      const borderColor = useMemo(
        () =>
          error
            ? 'border-red'
            : isFocused
              ? 'border-primary'
              : 'border-overlay-soft',
        [error, isFocused],
      );

      const labelColor = useMemo(
        () =>
          error ? 'text-red' : isFocused ? 'text-primary' : 'text-overlay-soft',
        [error, isFocused],
      );

      return (
        <View className={cn(`w-full`, containerClassName)} testID={testID}>
          <View className="relative">
            {/* Floating Label */}
            <Animated.View
              className="bg-dark-blue px-1 z-1 left-4 absolute"
              style={{
                top: labelTop,
              }}
            >
              <Animated.Text
                accessibilityRole="text"
                accessibilityLabel={label}
                className={labelColor}
                style={{
                  fontSize: labelFontSize,
                  fontFamily: 'Montserrat_400Regular',
                }}
                onPress={handleLabelPress}
              >
                {label}
              </Animated.Text>
            </Animated.View>

            {/* Text Input */}
            <TextInput
              ref={node => {
                inputRef.current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
              }}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`${label} input field`}
              value={value}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              testID={`${testID}-input`}
              className={cn(
                'w-full h-12 px-4 pb-0.5 text-white text-sm border rounded-base',
                isAndroid() && 'pb-1.5',
                borderColor,
              )}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...rest}
            />

            {/* Password Toggle Icon */}
            {secureTextEntry && (
              <TouchableOpacity
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Toggle password visibility"
                className="absolute right-4 top-3"
                testID={`${testID}-password-toggle`}
                onPress={togglePasswordVisibility}
              >
                {isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <Typo
              accessibilityRole="alert"
              accessibilityLabel={error}
              size="xs"
              weight="regular"
              className="text-red mt-1 ml-4"
              testID={`${testID}-error`}
            >
              {error}
            </Typo>
          )}
        </View>
      );
    },
  ),
);

Input.displayName = 'Input';

import { memo, ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// Uniwind
import { withUniwind } from 'uniwind';

// Utils
import { cn } from '@/utils/cn';
import { isIOS } from '@/utils/platform';

// Constants
import { KEYBOARD_BOTTOM_PADDING } from '@/constants';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledKeyboardAvoidingView = withUniwind(KeyboardAvoidingView);
const StyledScrollView = withUniwind(ScrollView);

type KeyboardLayoutProps = {
  children: ReactNode;
  contentPadding?: string;
  keyboardBottomPadding?: number;
};

export const KeyboardLayout = memo(
  ({
    children,
    contentPadding = 'px-6',
    keyboardBottomPadding = KEYBOARD_BOTTOM_PADDING,
  }: KeyboardLayoutProps) => {
    const insets = useSafeAreaInsets();
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
      const showSubscription = Keyboard.addListener(
        isIOS() ? 'keyboardWillShow' : 'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
        },
      );
      const hideSubscription = Keyboard.addListener(
        isIOS() ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
        },
      );

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);

    const handleKeyboardDismiss = () => {
      Keyboard.dismiss();
    };

    // Calculate offset: negative of bottom safe area to compensate
    const keyboardVerticalOffset = Platform.select({
      ios: -insets.bottom,
      android: 0,
    });

    // Add extra padding only when keyboard is visible to allow scrolling
    const bottomPadding = keyboardVisible ? keyboardBottomPadding : 0;

    return (
      <StyledSafeAreaView
        edges={['bottom']}
        accessible={false}
        importantForAccessibility="no"
        className="flex-1 bg-bg-primary"
      >
        <StyledKeyboardAvoidingView
          className="flex-1"
          behavior="padding"
          accessible={false}
          importantForAccessibility="no"
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TouchableWithoutFeedback
            accessible={false}
            importantForAccessibility="no"
            onPress={handleKeyboardDismiss}
          >
            <StyledScrollView
              contentContainerClassName={cn('flex-grow', contentPadding)}
              contentContainerStyle={{ paddingBottom: bottomPadding }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              scrollEnabled={true}
              accessible={false}
              importantForAccessibility="no"
            >
              {children}
            </StyledScrollView>
          </TouchableWithoutFeedback>
        </StyledKeyboardAvoidingView>
      </StyledSafeAreaView>
    );
  },
);

KeyboardLayout.displayName = 'KeyboardLayout';

import { memo, ReactNode } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Uniwind
import { useResolveClassNames, withUniwind } from 'uniwind';

// Components
import { Typo } from '@/components/Typo';

// Utils
import { cn } from '@/utils/cn';

type AccessLayoutProps = {
  loading?: boolean;
  children?: ReactNode;
  mode: 'onboarding' | 'signin' | 'signup' | 'confirmation';
};

const ACCESSIBILITY_LABEL = {
  signin: 'Sign in screen',
  signup: 'Sign up screen',
  onboarding: 'Onboarding screen',
  confirmation: 'Confirmation screen',
};

const StyledScrollView = withUniwind(ScrollView);
const StyledKeyboardAvoidingView = withUniwind(KeyboardAvoidingView);

export const AccessLayout = memo(
  ({ loading = false, mode = 'signin', children }: AccessLayoutProps) => {
    const isSignin = mode === 'signin';
    const isSignup = mode === 'signup';

    // Both signin and signup need keyboard-friendly behavior
    const needsKeyboardHandling = isSignin || isSignup;
    const withKeyboardHandlingStyles = needsKeyboardHandling
      ? cn(
          'flex-grow ',
          isSignin ? 'justify-center pb-8' : 'pb-42', // flex-grow allows scrolling, pb ensures submit button is visible
        )
      : 'flex-1';

    const accessibilityLabel = ACCESSIBILITY_LABEL[mode];

    const containerStyles = useResolveClassNames('flex-1 bg-bg-primary');

    const handleKeyboardDismiss = () => {
      Keyboard.dismiss();
    };

    return (
      <SafeAreaView
        edges={isSignin ? ['top', 'bottom'] : ['bottom']} // SignIn mode needs top edge for keyboard offset
        style={containerStyles}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityLabel}
      >
        <StyledKeyboardAvoidingView
          behavior="padding"
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
            <StyledScrollView
              contentContainerClassName={cn('px-4', withKeyboardHandlingStyles)}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {children}
            </StyledScrollView>
          </TouchableWithoutFeedback>
        </StyledKeyboardAvoidingView>

        {/* Loading Overlay */}
        {loading && (
          <View
            className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center bg-bg-dark/50"
            accessibilityLabel={
              isSignin ? 'Logging you in' : 'Creating your account'
            }
            accessibilityHint={
              isSignin ? 'Logging you in' : 'Creating your account'
            }
          >
            <View className="bg-bg-primary rounded-lg gap-6 items-center p-8">
              <ActivityIndicator size="large" className="text-primary" />
              <Typo weight="medium" size="xs" className="text-primary">
                {isSignin ? 'Logging you in...' : 'Creating your account...'}
              </Typo>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  },
);

AccessLayout.displayName = 'AccessLayout';

import { memo, ReactNode } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResolveClassNames } from 'uniwind';

// Components
import { Typo } from '@/components/common';

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

export const AccessLayout = memo(
  ({ loading = false, mode = 'signin', children }: AccessLayoutProps) => {
    const isSignin = mode === 'signin';

    const accessibilityLabel = ACCESSIBILITY_LABEL[mode];

    const containerStyles = useResolveClassNames('flex-1 bg-bg-primary');
    const contentContainerStyles = useResolveClassNames(
      `flex-1 p-4 ${isSignin && 'justify-center'}`,
    );

    return (
      <SafeAreaView
        edges={['bottom']}
        style={containerStyles}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityLabel}
      >
        <ScrollView
          contentContainerStyle={contentContainerStyles}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

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

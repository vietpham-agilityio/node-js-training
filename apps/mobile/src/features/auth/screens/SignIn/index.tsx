import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

// Constants
import { ERROR_MESSAGES, ROUTES, ToastType } from '@/constants';

// Hooks
import { useSignIn } from '@/features/auth/hooks/useSignIn';
import { useToastAlert } from '@/hooks/useToast';

// Types
import { SignInData } from '@/features/auth/types/auth';

// Icons
import { AppIcon } from '@/icons/AppIcon';

// Uniwind
import { useResolveClassNames, useUniwind } from 'uniwind';

// Components
import { Typo } from '@/components/Typo';
import { SignInForm } from '@/features/auth/components/SignInForm';

// Layout
import { AccessLayout } from '@/layouts/AccessLayout';

const LoginScreen = () => {
  const toast = useToastAlert();
  const { theme } = useUniwind();

  const { mutate: signIn, isPending: isSigningIn } = useSignIn();

  const appIconColorConfig = useResolveClassNames('text-white bg-secondary');

  const handleSubmit = useCallback(
    (data: SignInData) => {
      signIn(data, {
        onError: error => {
          toast.alert(ERROR_MESSAGES.LOGIN_FAILED, error.message, [], {
            type: ToastType.ERROR,
          });
        },
      });
    },
    [signIn, toast],
  );

  return (
    <AccessLayout mode="signin" loading={isSigningIn}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <View className="mt-8">
        <AppIcon
          width={88}
          height={88}
          accessible
          accessibilityRole="image"
          accessibilityLabel="App logo"
          accessibilityHint="Movea app logo"
          color={appIconColorConfig.color}
          stopColor={appIconColorConfig.backgroundColor}
        />
      </View>
      <View
        className="flex-col gap-1 mt-8 mb-[30]"
        accessible
        accessibilityRole="header"
        accessibilityLabel="Welcome back, Movie Lover!"
        accessibilityHint="Welcome back, Movie Lover!"
      >
        <Typo size="2xl" weight="medium">
          Welcome Back,
        </Typo>
        <Typo size="2xl" weight="medium">
          Movie Lover!
        </Typo>
      </View>

      <SignInForm isPending={isSigningIn} onSubmit={handleSubmit} />

      <View className="flex-row justify-center items-center gap-1 mt-5">
        <Typo weight="regular" size="xs">
          Create new account?
        </Typo>
        <Link href={ROUTES.SIGNUP} asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Sign up"
            accessibilityHint="Navigates to the Sign up screen"
          >
            <Typo className="text-text-currency" weight="medium" size="xs">
              Sign Up
            </Typo>
          </Pressable>
        </Link>
      </View>
    </AccessLayout>
  );
};

export default LoginScreen;

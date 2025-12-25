import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

// Constants
import { ERROR_MESSAGES, ROUTES, ToastType } from '@/constants';

// Hooks
import {
  useSignIn,
  useSignInWithFacebook,
  useSignInWithGoogle,
} from '@/features/auth/hooks/useSignIn';
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
import {
  ThirdPartyButton,
  ThirdPartyButtonType,
} from '@/features/auth/components/ThirdPartyButton';

// Layout
import { AccessLayout } from '@/layouts/AccessLayout';

const LoginScreen = () => {
  const toast = useToastAlert();
  const { theme } = useUniwind();

  const { mutate: signIn, isPending: isSigningIn } = useSignIn();
  const { mutate: signInWithGoogle, isPending: isGoogleLoading } =
    useSignInWithGoogle();
  const { mutate: signInWithFacebook, isPending: isFacebookLoading } =
    useSignInWithFacebook();

  const appIconColorConfig = useResolveClassNames('text-white bg-secondary');

  const handleSubmit = useCallback(
    (data: SignInData) => {
      signIn(data, {
        onError: (error: Error) => {
          toast.alert(
            ERROR_MESSAGES.LOGIN_FAILED,
            error.message || ERROR_MESSAGES.INVALID_EMAIL_PASSWORD,
            [],
            {
              type: ToastType.ERROR,
            },
          );
        },
      });
    },
    [signIn, toast],
  );

  const handleGoogleSignIn = useCallback(() => {
    signInWithGoogle(undefined, {
      onError: (error: Error) => {
        toast.alert(ERROR_MESSAGES.GOOGLE_SIGN_IN_FAILED, error.message, [], {
          type: ToastType.ERROR,
        });
      },
    });
  }, [signInWithGoogle, toast]);

  const handleFacebookSignIn = useCallback(() => {
    signInWithFacebook(undefined, {
      onError: (error: Error) => {
        toast.alert(ERROR_MESSAGES.FACEBOOK_SIGN_IN_FAILED, error.message, [], {
          type: ToastType.ERROR,
        });
      },
    });
  }, [signInWithFacebook, toast]);

  const isLoading = isSigningIn || isGoogleLoading || isFacebookLoading;

  return (
    <AccessLayout mode="signin" loading={isLoading}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <View className="mt-8">
        <AppIcon
          width={88}
          height={88}
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

      <SignInForm
        isPending={isSigningIn}
        onSubmit={handleSubmit}
        onForgotPassword={() => router.push(ROUTES.FORGOT_PASSWORD)}
      />

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

      <View className="flex-row justify-center items-center gap-8 mt-7">
        <ThirdPartyButton
          testID="signin-google-button"
          type={ThirdPartyButtonType.GOOGLE}
          onPress={handleGoogleSignIn}
          isPending={isLoading}
        />
        <ThirdPartyButton
          testID="signin-facebook-button"
          type={ThirdPartyButtonType.FACEBOOK}
          onPress={handleFacebookSignIn}
          isPending={isLoading}
        />
      </View>
    </AccessLayout>
  );
};

export default LoginScreen;

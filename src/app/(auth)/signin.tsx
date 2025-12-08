// Types

// Components
import { Typo } from '@/components/common';
import { AccessLayout } from '@/components/layouts';
import { ROUTES } from '@/constants';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

const LoginScreen = () => {
  return (
    <AccessLayout mode="signin">
      {/* Header */}
      <View className="flex-col items-baseline gap-1 mb-1">
        <Typo size="2xl" weight="medium">
          Welcome Back,
        </Typo>
        <Typo size="2xl" weight="medium">
          Movie Lover!
        </Typo>
      </View>

      {/* <LoginForm onSubmit={handleSubmit} loading={isSigningIn} /> */}

      <View className="flex-row justify-center items-center gap-1">
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

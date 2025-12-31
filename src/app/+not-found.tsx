import { Link, Stack } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';

// Components
import { Button } from '@/components/Button';
import { Typo } from '@/components/Typo';
import { ROUTES } from '@/constants';

/**
 * This screen is displayed when navigating to an unmatched route
 * It's automatically rendered by Expo Router for 404 errors
 */
export default function NotFoundScreen() {
  useEffect(() => {
    // Announce to screen reader when 404 is shown
    AccessibilityInfo.announceForAccessibility(
      'Page not found. Error 404. Please navigate to home or browse movies.',
    );
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View
        className="flex-1 bg-bg-primary justify-center items-center px-6"
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel="Page not found error screen"
      >
        {/* 404 Illustration */}
        <View className="items-center mb-8">
          <Typo
            size="2xl"
            weight="semibold"
            className="mb-2"
            accessibilityRole="header"
            accessibilityLabel="Error 404"
          >
            404
          </Typo>
          <Typo
            size="2xl"
            weight="semibold"
            className="text-center mb-3"
            accessibilityRole="header"
          >
            Page Not Found
          </Typo>
          <Typo className="text-center max-w-sm mb-6" accessibilityRole="text">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved or deleted.
          </Typo>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-3" accessibilityLabel="Navigation options">
          <Link href={ROUTES.HOME} asChild>
            <Button
              accessible
              accessibilityLabel="Go to home page"
              accessibilityHint="Tap to navigate to the home page"
              accessibilityRole="button"
              title="Go to Home"
              isPrimary={false}
              onPress={() => null}
            />
          </Link>

          {/* Help Text */}
          <Typo
            size="sm"
            weight="medium"
            className="text-center mt-8"
            accessibilityRole="text"
            accessibilityHint="Helpful suggestion"
          >
            Lost? Try searching from the home page
          </Typo>
        </View>
      </View>
    </>
  );
}

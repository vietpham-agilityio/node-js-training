import { type ErrorBoundaryProps } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { AccessibilityInfo, View } from 'react-native';

import { Button } from '@/components/Button';
import { Typo } from '@/components/Typo';

interface AppError extends Error {
  code?: number;
}

export const ErrorBoundary = ({ error, retry }: ErrorBoundaryProps) => {
  const appError = error as AppError;

  /**
   * Classify error
   */
  const meta = useMemo(() => {
    if (appError.code === 401) {
      return {
        title: 'Session expired',
        message: 'Please sign in again to continue.',
        fatal: true,
      };
    }

    if (appError.code === 403) {
      return {
        title: 'Access denied',
        message: 'You do not have permission to view this content.',
        fatal: true,
      };
    }

    if (appError.code && appError.code >= 500) {
      return {
        title: 'Server error',
        message: 'Something went wrong on our side. Please try again.',
        fatal: false,
      };
    }

    return {
      title: 'Something went wrong',
      message: appError.message || 'Unexpected error occurred.',
      fatal: false,
    };
  }, [appError]);

  /**
   * Accessibility announce
   */
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `Error: ${meta.title}. ${meta.message}`,
    );
  }, [meta]);

  /**
   * Retry visibility
   */
  const showRetry = Boolean(!meta.fatal);

  return (
    <View
      className="flex-1 bg-bg-primary justify-center items-center px-6"
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Typo size="2xl" weight="semibold" className="mb-3">
        {meta.title}
      </Typo>

      <Typo className="text-center max-w-sm mb-6">{meta.message}</Typo>

      {showRetry && (
        <View className="w-full">
          <Button
            title="Try Again"
            onPress={retry}
            accessibilityLabel="Try again"
          />
        </View>
      )}

      {!showRetry && (
        <Typo size="sm" className="mt-6 opacity-70 text-center">
          Please go back or refresh the app.
        </Typo>
      )}
    </View>
  );
};

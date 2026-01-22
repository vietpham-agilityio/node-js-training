import { AuthenticationError } from '@/features/auth/error/auth';
import { Effect } from 'effect';

/**
 * Log authentication error details in development mode
 * Using explicit Effect composition (no generators)
 */
export const logAuthError = (error: unknown): Effect.Effect<void> => {
  if (!__DEV__) {
    return Effect.void;
  }

  // Build logging effects based on error type
  const basicLogs = Effect.all(
    [
      Effect.log('[Auth Error] Type:', error?.constructor?.name),
      Effect.log('[Auth Error]:', error),
    ],
    { concurrency: 'unbounded' }, // Run the logs concurrently
  );

  // Add AuthenticationError specific logs if applicable
  if (error instanceof AuthenticationError) {
    const authLogs = Effect.all(
      [
        Effect.log('[Auth Error] Message:', error.message),
        Effect.log('[Auth Error] Details:', error.getDetails()),
      ],
      { concurrency: 'unbounded' },
    );

    const causeLogs = error.hasCause()
      ? Effect.log('[Auth Error] Cause:', error.getCause())
      : Effect.void;

    // Combine all logs sequentially
    return Effect.flatMap(basicLogs, () =>
      Effect.flatMap(authLogs, () => causeLogs),
    );
  }

  return Effect.map(basicLogs, () => undefined);
};

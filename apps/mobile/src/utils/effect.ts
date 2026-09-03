import { Cause, Chunk, Effect, Exit, Layer } from 'effect';

/**
 * Helper to unwrap Effect for React Query
 *
 * Converts an Effect into a Promise that React Query can consume.
 * This function runs the Effect and handles both success and failure cases:
 * - On success: returns the unwrapped value
 * - On failure: extracts the first error from the Cause and throws it,
 *   or throws a generic error if no specific failure is found
 *
 * @template A - The success type of the Effect
 * @template E - The error type of the Effect
 * @template R - The requirements type of the Effect
 * @param effect - The Effect to run and unwrap
 * @param layer - Optional Layer to provide when running the Effect
 * @returns A Promise that resolves with the success value or rejects with an error
 *
 */
export const runEffectForQuery = async <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  layer?: Layer.Layer<R, never, never>,
): Promise<A> => {
  // Provide the layer if given, otherwise run the effect as-is
  const effectToRun = layer
    ? Effect.provide(effect, layer)
    : (effect as Effect.Effect<A, E>);

  // Run the Effect and get an Exit (success or failure)
  const exit = await Effect.runPromiseExit(effectToRun);

  // Match on the Exit to handle both success and failure cases
  return Exit.match(exit, {
    // On success, return the unwrapped value
    onSuccess: value => value,
    // On failure, extract and throw the error
    onFailure: cause => {
      // Get all failures from the Cause
      const failures = Cause.failures(cause);
      // If there are failures, throw the first one
      if (Chunk.size(failures) > 0) {
        throw Chunk.unsafeGet(failures, 0);
      }
      // If no specific failure found, throw a generic error
      throw new Error('Unknown error occurred');
    },
  });
};

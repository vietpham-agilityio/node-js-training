import { Cause, Effect, Exit, Chunk } from 'effect';

/**
 * Helper to unwrap Effect for React Query
 */
export const runEffectForQuery = async <A, E>(
  effect: Effect.Effect<A, E>,
): Promise<A> => {
  const exit = await Effect.runPromiseExit(effect);

  return Exit.match(exit, {
    onSuccess: value => value,
    onFailure: cause => {
      const failures = Cause.failures(cause);
      if (Chunk.size(failures) > 0) {
        throw Chunk.unsafeGet(failures, 0);
      }
      throw new Error('Unknown error occurred');
    },
  });
};

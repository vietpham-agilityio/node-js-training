import { Config, Effect } from 'effect';

// Types
import { FetchPokemonErr, ExtractResponseErr } from '@/types/error';

// Utils
import { decodePokemon } from '@/utils/formats';

export const getPokemnon = Effect.gen(function* () {
  const baseUrl = yield* Config.string('EXPO_PUBLIC_POKEMON_DITTO');

  const response = yield* Effect.tryPromise({
    try: () => fetch(baseUrl),
    catch: () =>
      new FetchPokemonErr({ customMessage: 'Fetch Pokemon went wrong' }),
  });

  if (!response.ok)
    yield* new FetchPokemonErr({
      customMessage: 'Fetch Pokemon with response not ok',
    });

  const jsonResponse = yield* Effect.tryPromise({
    try: () => response.json(),
    catch: () => new ExtractResponseErr(),
  });

  return yield* decodePokemon(jsonResponse);
});

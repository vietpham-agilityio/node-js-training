import { Config, ConfigError, Context, Effect, ParseResult } from 'effect';

// Types
import { ExtractResponseErr, FetchPokemonErr } from '@/types/error';

// Constants
import { Pokemon } from '@/constants/schema';

// Utils
import { decodePokemon } from '@/utils/formats';

interface IPokeApi {
  readonly getPokemon: Effect.Effect<
    typeof Pokemon.Type,
    | ParseResult.ParseError
    | ConfigError.ConfigError
    | FetchPokemonErr
    | ExtractResponseErr
  >;
}

// PokeApiTag is a tag for the PokeApi context
// PokeApi at first is type of IPokeApi class
// IPokeApi is a interface for the PokeApi context
export class PokeApi extends Context.Tag('PokeApiTag')<PokeApi, IPokeApi>() {
  static readonly Live = PokeApi.of({
    getPokemon: Effect.gen(function* () {
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
    }),
  });
}

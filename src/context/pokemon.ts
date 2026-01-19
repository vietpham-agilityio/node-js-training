import { ConfigError, Context, Effect, ParseResult, Layer } from 'effect';

// Types
import { ExtractResponseErr, FetchPokemonErr } from '@/types/error';

// Constants
import { Pokemon } from '@/constants/schema';

// Utils
import { decodePokemon } from '@/utils/formats';

// Contexts
import { PokemonCollection } from './pokemonCollection';
import { BuildPokemonUrl } from './buildPokemonUrl';

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

const pokemonImplement = Effect.gen(function* () {
  const pokemonCollection = yield* PokemonCollection;
  const buildPokemonUrl = yield* BuildPokemonUrl;

  return {
    getPokemon: Effect.gen(function* () {
      const combinedPokemonUrl = buildPokemonUrl({
        name: pokemonCollection[2]!,
      });

      const response = yield* Effect.tryPromise({
        try: () => fetch(combinedPokemonUrl),
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
  };
});

export class PokeApi extends Context.Tag('PokeApiTag')<
  PokeApi,
  Effect.Effect.Success<typeof pokemonImplement>
>() {
  static readonly Live = Layer.effect(this, pokemonImplement).pipe(
    Layer.provide(Layer.mergeAll(PokemonCollection.Live, BuildPokemonUrl.Live)),
  );
}

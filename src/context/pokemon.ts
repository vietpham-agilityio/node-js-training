import { Effect } from 'effect';

// Types
import { ExtractResponseErr, FetchPokemonErr } from '@/types/error';

// Utils
import { decodePokemon } from '@/utils/formats';

// Contexts
import { PokemonCollection } from './pokemonCollection';
import { BuildPokemonUrl } from './buildPokemonUrl';

export class PokeApi extends Effect.Service<PokeApi>()('PokeApiTag', {
  effect: Effect.gen(function* () {
    const pokemonCollection = yield* PokemonCollection;
    const buildPokemonUrl = yield* BuildPokemonUrl;

    return {
      getPokemon: Effect.gen(function* () {
        const requestUrl = buildPokemonUrl({ name: pokemonCollection[2]! });

        const response = yield* Effect.tryPromise({
          try: () => fetch(requestUrl),
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
  }),
  dependencies: [PokemonCollection.Default, BuildPokemonUrl.Default],
}) {}

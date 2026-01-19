import { Effect } from 'effect';

// Contexts
import { PokemonUrl } from './pokemonUrl';

export class BuildPokemonUrl extends Effect.Service<BuildPokemonUrl>()(
  'BuildPokemonUrlTag',
  {
    effect: Effect.gen(function* () {
      const pokeBaseUrl = yield* PokemonUrl;

      return ({ name }: { name: string }) => `${pokeBaseUrl}/${name}`;
    }),
    dependencies: [PokemonUrl.Live],
  },
) {}

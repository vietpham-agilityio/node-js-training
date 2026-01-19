import { Context, Effect } from 'effect';

// Contexts
import { PokemonUrl } from './pokemonUrl';

export class BuildPokemonUrl extends Context.Tag('BuildPokemonUrlTag')<
  BuildPokemonUrl,
  ({ name }: { name: string }) => string
>() {
  static readonly Live = Effect.gen(function* () {
    const pokeBaseUrl = yield* PokemonUrl;

    return BuildPokemonUrl.of(({ name }) => `${pokeBaseUrl}/${name}`);
  });
}

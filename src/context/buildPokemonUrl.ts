import { Context, Effect, Layer } from 'effect';

// Contexts
import { PokemonUrl } from './pokemonUrl';

export class BuildPokemonUrl extends Context.Tag('BuildPokemonUrlTag')<
  BuildPokemonUrl,
  ({ name }: { name: string }) => string
>() {
  static readonly Live = Layer.effect(
    this,
    Effect.gen(function* () {
      const pokeBaseUrl = yield* PokemonUrl;

      return ({ name }) => `${pokeBaseUrl}/${name}`;
    }),
  ).pipe(Layer.provide(PokemonUrl.Live));
}

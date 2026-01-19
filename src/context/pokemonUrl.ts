import { Config, Context, Effect, Layer } from 'effect';

export class PokemonUrl extends Context.Tag('PokemonUrlTag')<
  PokemonUrl,
  string
>() {
  static readonly Live = Layer.effect(
    this,
    Effect.gen(function* () {
      const baseUrl = yield* Config.string('EXPO_PUBLIC_BASE_URL_POKEMON');

      return PokemonUrl.of(baseUrl);
    }),
  );
}

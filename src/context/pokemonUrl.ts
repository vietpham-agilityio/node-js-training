import { Config, Context, Effect } from 'effect';

export class PokemonUrl extends Context.Tag('PokemonUrlTag')<
  PokemonUrl,
  string
>() {
  static readonly Live = Effect.gen(function* () {
    const baseUrl = yield* Config.string('EXPO_PUBLIC_BASE_URL_POKEMON');

    return PokemonUrl.of(baseUrl);
  });
}

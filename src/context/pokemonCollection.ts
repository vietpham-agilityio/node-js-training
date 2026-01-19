import { Context, Layer, type Array } from 'effect';

export class PokemonCollection extends Context.Tag('PokemonCollectionTag')<
  PokemonCollection,
  Array.NonEmptyArray<string>
>() {
  static readonly Live = Layer.succeed(this, [
    'ditto',
    'bulbasaur',
    'charmander',
    'squirtle',
  ]);
}

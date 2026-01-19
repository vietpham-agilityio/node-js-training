import { Context, type Array } from 'effect';

export class PokemonCollection extends Context.Tag('PokemonCollectionTag')<
  PokemonCollection,
  Array.NonEmptyArray<string>
>() {
  static readonly Live = PokemonCollection.of([
    'ditto',
    'bulbasaur',
    'charmander',
    'squirtle',
  ]);
}

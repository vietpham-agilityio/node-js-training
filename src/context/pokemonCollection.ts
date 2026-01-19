import { Effect } from 'effect';

export class PokemonCollection extends Effect.Service<PokemonCollection>()(
  'PokemonCollectionTag',
  {
    succeed: ['ditto', 'bulbasaur', 'charmander', 'squirtle'],
  },
) {}

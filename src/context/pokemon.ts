import { ConfigError, Context, Effect, ParseResult } from 'effect';

// Types
import { ExtractResponseErr, FetchPokemonErr } from '@/types/error';

// Constants
import { Pokemon } from '@/constants/schema';

interface PokeApi {
  readonly getPokemon: Effect.Effect<
    typeof Pokemon.Type,
    | ParseResult.ParseError
    | ConfigError.ConfigError
    | FetchPokemonErr
    | ExtractResponseErr
  >;
}

export const PokeApi = Context.GenericTag<PokeApi>('PokeApi');

import { Data } from 'effect';

export class FetchPokemonErr extends Data.TaggedError('FetchPokemonErr')<{
  customMessage: string;
}> {}

export class ExtractResponseErr extends Data.TaggedError(
  'ExtractResponseErr',
) {}

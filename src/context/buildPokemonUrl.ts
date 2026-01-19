import { Context } from 'effect';

export class BuildPokemonUrl extends Context.Tag('BuildPokemonUrlTag')<
  BuildPokemonUrl,
  string
>() {}

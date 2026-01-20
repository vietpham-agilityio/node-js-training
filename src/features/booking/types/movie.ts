/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Schema } from 'effect';

export enum MovieStatus {
  NOW_PLAYING = 'now_playing',
  COMING_SOON = 'coming_soon',
  ENDED = 'ended',
}

export enum PromoCodeStatus {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum GenreMovie {
  ALL = 'all',
  ACTION = 'action',
  ADVENTURE = 'adventure',
  ANIMATION = 'animation',
  COMEDY = 'comedy',
  CRIME = 'crime',
  DOCUMENTARY = 'documentary',
  DRAMA = 'drama',
  FAMILY = 'family',
  FANTASY = 'fantasy',
  HISTORY = 'history',
  HORROR = 'horror',
  MUSIC = 'music',
  MYSTERY = 'mystery',
  ROMANCE = 'romance',
  SCI_FI = 'science_fiction',
  TV_MOVIE = 'tv_movie',
  THRILLER = 'thriller',
  WAR = 'war',
  WESTERN = 'western',
}

export const CastMemberSchema = Schema.Struct({
  character: Schema.optional(Schema.String),
  name: Schema.String,
  imageUrl: Schema.optional(Schema.String),
});

export const CrewMemberSchema = Schema.Struct({
  name: Schema.String,
});

export const CastCrewSchema = Schema.Struct({
  actors: Schema.Array(CastMemberSchema),
  directors: Schema.Array(CrewMemberSchema),
  producers: Schema.Array(CrewMemberSchema),
  writers: Schema.Array(CrewMemberSchema),
});

export const MovieSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  synopsis: Schema.String,
  posterUrl: Schema.String,
  trailerUrl: Schema.Array(Schema.String),
  durationMinutes: Schema.Number,
  releaseDate: Schema.String,
  rating: Schema.Number,
  genre: Schema.Array(Schema.Enums(GenreMovie)),
  castCrew: CastCrewSchema,
  language: Schema.optional(Schema.String),
  status: Schema.Enums(MovieStatus),
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export const PromoCodeSchema = Schema.Struct({
  id: Schema.String,
  code: Schema.String,
  description: Schema.optional(Schema.String),
  discountType: Schema.Enums(PromoCodeStatus),
  discountValue: Schema.Number,
  minPurchaseAmount: Schema.optional(Schema.Number),
  maxDiscountAmount: Schema.optional(Schema.Number),
  usageLimit: Schema.optional(Schema.Number),
  usageCount: Schema.optional(Schema.Number),
  validFrom: Schema.optional(Schema.String),
  validUntil: Schema.optional(Schema.String),
  isActive: Schema.optional(Schema.Boolean),
  createdAt: Schema.optional(Schema.String),
  updatedAt: Schema.optional(Schema.String),
});

export interface Movie extends Schema.Schema.Type<typeof MovieSchema> {}
export interface PromoCode extends Schema.Schema.Type<typeof PromoCodeSchema> {}
export interface CastMember extends Schema.Schema.Type<
  typeof CastMemberSchema
> {}
export interface CrewMember extends Schema.Schema.Type<
  typeof CrewMemberSchema
> {}
export interface CastCrew extends Schema.Schema.Type<typeof CastCrewSchema> {}

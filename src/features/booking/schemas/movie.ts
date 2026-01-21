/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Schema } from 'effect';

// Status schemas using Schema.Literal
export const MovieStatusSchema = Schema.Literal(
  'now_playing',
  'coming_soon',
  'ended',
);
export const PromoCodeStatusSchema = Schema.Literal(
  'percentage',
  'fixed_amount',
);
export const GenreMovieSchema = Schema.Literal(
  'all',
  'action',
  'adventure',
  'animation',
  'comedy',
  'crime',
  'documentary',
  'drama',
  'family',
  'fantasy',
  'history',
  'horror',
  'music',
  'mystery',
  'romance',
  'science_fiction',
  'tv_movie',
  'thriller',
  'war',
  'western',
);

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
  genre: Schema.Array(GenreMovieSchema),
  castCrew: CastCrewSchema,
  language: Schema.optional(Schema.String),
  status: MovieStatusSchema,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export const PromoCodeSchema = Schema.Struct({
  id: Schema.String,
  code: Schema.String,
  description: Schema.optional(Schema.String),
  discountType: PromoCodeStatusSchema,
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

// Status types derived from schemas
export type MovieStatus = Schema.Schema.Type<typeof MovieStatusSchema>;
export type PromoCodeStatus = Schema.Schema.Type<typeof PromoCodeStatusSchema>;
export type GenreMovie = Schema.Schema.Type<typeof GenreMovieSchema>;

// Interface types derived from schemas
export interface Movie extends Schema.Schema.Type<typeof MovieSchema> {}
export interface PromoCode extends Schema.Schema.Type<typeof PromoCodeSchema> {}
export interface CastMember extends Schema.Schema.Type<
  typeof CastMemberSchema
> {}
export interface CrewMember extends Schema.Schema.Type<
  typeof CrewMemberSchema
> {}
export interface CastCrew extends Schema.Schema.Type<typeof CastCrewSchema> {}

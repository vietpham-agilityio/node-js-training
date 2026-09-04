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

// Legacy genre vocabulary. Kept for callers that still key off fixed names; the
// live genre list now comes from `GET /genres` (see `useGenres`).
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
  durationMinutes: Schema.Number,
  releaseDate: Schema.String,
  rating: Schema.Number,
  // Genre names from the API (`GET /genres`); no longer a fixed vocabulary.
  genre: Schema.Array(Schema.String),
  language: Schema.optional(Schema.String),
  // Derived client-side from `releaseDate` — the API has no status field.
  status: MovieStatusSchema,
  createdAt: Schema.String,
  updatedAt: Schema.String,
  // The API does not carry these; populated only where a legacy source does.
  trailerUrl: Schema.optional(Schema.Array(Schema.String)),
  castCrew: Schema.optional(CastCrewSchema),
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

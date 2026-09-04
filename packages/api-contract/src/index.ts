/**
 * The typed contract between `@movea/api` and `@movea/mobile`.
 *
 * Everything here is derived from the API's own OpenAPI document — run
 * `pnpm contract:generate` from the repo root after changing a controller or
 * DTO. Nothing in this package is hand-written on purpose: status vocabularies
 * such as seat-hold state are load-bearing (ADR-008 ties them to a partial
 * unique index), so a second hand-maintained copy is exactly the drift this
 * package exists to prevent.
 */
export type {
  components,
  operations,
  paths,
  webhooks,
} from './generated/schema';

import type { components } from './generated/schema';

/** Every DTO the API publishes, keyed by its Swagger schema name. */
export type Schemas = components['schemas'];

/**
 * Named aliases (`Reservation`, `Showtime`, `SeatHoldStatus`, …) get added
 * here as the mobile app migrates each feature off Supabase, so the app
 * imports intent-revealing names rather than reaching into `Schemas` directly.
 */

/** `POST /auth/login` request body. */
export type LoginRequest = Schemas['LoginDto'];
/** `POST /auth/register` request body. */
export type RegisterRequest = Schemas['RegisterDto'];
/** `POST /auth/refresh` and `POST /auth/logout` request body. */
export type RefreshTokenRequest = Schemas['RefreshTokenDto'];
/** What `login`, `register` and `refresh` return. */
export type TokenPair = Schemas['TokenPairDto'];
/** What `GET /auth/me` returns — the authenticated user from the access token. */
export type AuthUser = Schemas['MeResponseDto'];
/** The authenticated user's full profile — what `GET /users/me` returns. */
export type UserProfile = Schemas['UserResponseDto'];
/** `PATCH /users/me` request body. */
export type UpdateUserProfileRequest = Schemas['UpdateProfileDto'];

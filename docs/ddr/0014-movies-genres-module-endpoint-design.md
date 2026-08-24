# DDR-014 — Movies/Genres module endpoint design

Accepted · 24 Aug 2026 · Implements ADR-001, ADR-006, ADR-010, ADR-012

## Context

`src/modules/movies/` had `Movie`, `Genre` and `MovieGenre` entities but no service or
controller. BR-13 (genre name uniqueness), BR-30 (a movie needs at least one genre) and
ADR-010 (soft delete) constrain the shape without fully determining it — in particular,
neither says whether a genre is soft- or hard-deleted, when exactly "at least one genre"
is enforced, or how a public route (movie browsing) can still behave differently for an
admin. This record fills in the rest, the way DDR-012 did for Users.

## Decision

- **Genres are hard-deleted**, not soft-deleted like `Movie`/`User`. `DELETE /genres/:id`
  first counts `MovieGenre` rows referencing it; if any exist it throws `GENRE_IN_USE`
  (409) before touching the row, then does a real `repository.delete`.
- **A movie must carry at least one genre at all times**, not just while
  `is_active = true`. `POST /movies` rejects an empty `genreIds` and
  `PATCH /movies/:id` rejects replacing `genreIds` with `[]`, both with
  `MOVIE_REQUIRES_GENRE` (400) — enforced in the service, not the DTO, so the error
  carries that specific code instead of a generic validation 400.
- **`OptionalJwtAuthGuard`** (`src/common/guards/optional-jwt-auth.guard.ts`) — new
  guard, same `AuthGuard('jwt')` base as `JwtAuthGuard` but `handleRequest` returns
  `user ?? undefined` instead of throwing. Applied to `GET /movies` and
  `GET /movies/:id`: both stay public, but `includeInactive` is derived from
  `user?.role === UserRole.ADMIN`, so an admin's token additionally reveals inactive
  movies from the same route.
- **Duplicate genre name is `409 GENRE_NAME_ALREADY_EXISTS`**, a new error code mirroring
  `EMAIL_ALREADY_REGISTERED`'s existing pattern, not a generic `400 BAD_REQUEST`.
- **`GET /movies` filtering (`genreId`, `title`) and genre eager-loading use a
  `QueryBuilder`**, not `BaseAbstractService.findAll` — the base method has no join or
  filter support, and this is the first module to need one (`movie_genres` subquery for
  `genreId`, `ILIKE` for `title`).

## Why

- **Hard vs. soft delete split.** `User`/`Movie` soft-delete because their rows have
  reservation/booking history worth preserving (ADR-010's original reasoning). A `Genre`
  row has no history of its own — BR-13's uniqueness constraint means nothing downstream
  needs to distinguish "this name was retired" from "this name never existed" — and the
  `movie_genres.genre_id` FK is already `ON DELETE RESTRICT`, so a genre still in use
  can't be hard-deleted by accident regardless. `GENRE_IN_USE` just turns that FK failure
  into a clean 409 instead of a raw database error reaching the client.
- **Genre requirement enforced uniformly, not just at publish.** BR-30 is phrased in
  terms of "exposed to public browsing", but `movies.is_active` defaults `true`, so a
  freshly created movie is exposed the moment it's created. Tracking two separate rules
  (strict at creation, lenient while inactive) would mean the ordering — deactivate, then
  freely strip genres, then reactivate with none — could silently produce exactly the
  row BR-30 forbids. One rule enforced in the service at both `create` and `update`
  closes that gap.
- **`OptionalJwtAuthGuard` over a second endpoint.** An admin "preview inactive movies"
  route would duplicate the list/detail query and filter logic for what is really one
  boolean. A guard that just makes `request.user` optional keeps `MoviesController` to
  one code path per route and is directly reusable by the showtime endpoints that need
  the same "public, but richer for an admin" shape later.
- **`GENRE_NAME_ALREADY_EXISTS` over generic 400.** The API document's own general
  status-code table already treats duplicate values as 409 Conflict, and
  `EMAIL_ALREADY_REGISTERED` already established that pattern for this codebase. The
  specific Genre entry in the Word doc says plain `400 BAD_REQUEST`; that's a doc bug to
  fix in the docs-sync pass, not a contract worth matching literally. Confirmed with the
  user before implementing.

## Rejected

- **Soft-deleting genres** (`is_active` flag, like `Movie`) — rejected: adds a column and
  a filter everywhere genres are read, for a row type with no history to preserve and an
  FK that already prevents dangling references.
- **A separate `GET /movies?includeInactive=true` admin route** instead of
  `OptionalJwtAuthGuard` — rejected: still needs the caller's role to authorize the flag,
  which means checking the token anyway; a guard that makes the token optional is
  strictly simpler than a second gate on top of the same route.
- **Enforcing `MOVIE_REQUIRES_GENRE` only when `isActive` is (or becomes) `true`** — the
  literal reading of BR-30 — rejected for the "deactivate, strip genres, reactivate"
  loophole described above.

## Consequences

| Gains                                                                                                                            | Costs accepted                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A genre can never be deleted out from under a movie that references it, and the failure mode is a clean 409, not a raw FK error. | Genres and Movies now have two different delete semantics in one module — a reader has to know which.                                                    |
| `OptionalJwtAuthGuard` is a one-time addition reusable by Showtimes' equivalent public-but-richer-for-admin routes.              | One more guard type in `src/common/guards/` to keep in sync with `JwtAuthGuard` if its behavior changes.                                                 |
| `MOVIE_REQUIRES_GENRE` is impossible to violate regardless of the order create/deactivate/update happen in.                      | The check lives in the service rather than the DTO, so it doesn't show up in the generated OpenAPI validation constraints the way `@ArrayMinSize` would. |

## Follow-up

- When Showtimes' `GET /showtimes/:id/seats` (optional Bearer, per `docs/api/README.md`)
  is implemented, reuse `OptionalJwtAuthGuard` rather than writing a second variant.
- Correct the Genre entry in `docs/api/README.md` / the source Word doc to say
  `409 GENRE_NAME_ALREADY_EXISTS` instead of `400 BAD_REQUEST`, in the pending docs-sync
  pass.

## Revisit if

Genres ever need their own history (e.g. a "deprecated but keep for old movies" state) —
at that point the hard-delete decision above should be superseded, not silently patched.

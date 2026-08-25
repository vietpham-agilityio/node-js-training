# Decisions vs. code

What the records say against what is committed on this branch. Keep this table honest — an
ADR that quietly disagrees with the code is worse than no ADR.

Last checked: 25 Aug 2026, on `feat/ticket-reservation` (Showtimes/Halls module landed).

## Implemented and matching

| Record  | Where                                                                                                                                                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-001 | `src/app.module.ts`, `src/modules/` — one Nest app, modules registered at root                                                                                                                                                                          |
| ADR-002 | `src/database/data-source.options.ts` — `type: 'postgres'`                                                                                                                                                                                              |
| ADR-003 | `package.json` — `typeorm`, `@nestjs/typeorm`; migrations under `src/database/migrations/`                                                                                                                                                              |
| ADR-004 | `src/main.ts` — `NestFactory.create(AppModule)` with no adapter, i.e. Express                                                                                                                                                                           |
| ADR-005 | `src/modules/auth/` — bcrypt, RS256 JWT access token, SHA-256-hashed refresh tokens                                                                                                                                                                     |
| ADR-006 | `src/common/decorators/roles.decorator.ts`, `src/common/guards/roles.guard.ts`                                                                                                                                                                          |
| ADR-010 | `src/modules/users/`, `src/modules/movies/` — `is_active` flag + soft-delete `remove()`; `src/modules/showtimes/showtimes.service.ts` — `remove()` moves `status` to `cancelled`. Reservations/SeatHolds `status` transitions still pending (see below) |
| ADR-012 | `src/main.ts` — `SwaggerModule` at `${apiPrefix}/docs`, URI versioning                                                                                                                                                                                  |
| ADR-014 | `docker-compose.yml`, `.env.example`                                                                                                                                                                                                                    |
| DDR-006 | `src/common/filters/all-exceptions.filter.ts` — `{ statusCode, errorCode, message, timestamp }`                                                                                                                                                         |
| DDR-008 | `src/config/env.validation.ts` — Joi schema, `abortEarly: false`, boot-time failure                                                                                                                                                                     |
| DDR-011 | `src/common/dto/pagination-query.dto.ts` — one-indexed pages, supersedes DDR-005                                                                                                                                                                        |
| DDR-012 | `src/modules/users/users.controller.ts`, `users.service.ts` — endpoint/permission design                                                                                                                                                                |
| DDR-013 | `src/modules/users/users.controller.ts` — `PATCH /users/me/password`                                                                                                                                                                                    |
| DDR-014 | `src/modules/movies/genres.controller.ts`, `genres.service.ts`, `movies.controller.ts`, `movies.service.ts` — endpoint/permission design                                                                                                                |
| ADR-013 | `src/database/migrations/1787211926318-InitSchema.ts` — every FK indexed, plus the composite paths ADR-013 names                                                                                                                                        |
| DDR-003 | `src/modules/showtimes/showtimes.service.ts` — `findSeatOccupancyRows` is the one derivation behind both the seat map and the availability triple; no counter column exists                                                                             |
| DDR-015 | `src/modules/showtimes/halls.controller.ts`, `halls.service.ts`, `showtimes.controller.ts`, `showtimes.service.ts` — endpoint/permission design                                                                                                         |
| DDR-016 | `src/modules/showtimes/showtimes.service.ts` — `ALLOWED_TRANSITIONS`, `assertStatusTransition`, `assertModifiable`                                                                                                                                      |

## Diverging — needs a fix or a superseding record

| Record                   | Says                                                                               | Code does                                                                                                 | Where                                                 |
| ------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| DDR-007                  | `forbidNonWhitelisted` deliberately **off**                                        | `forbidNonWhitelisted: true`                                                                              | `src/app.module.ts`                                   |
| `docs/database/views.md` | Defines six database views                                                         | **None of them exist** — no `CREATE VIEW` anywhere; the two showtime views are rebuilt as a query builder | `1787211926318-InitSchema.ts`, `showtimes.service.ts` |
| `docs/database/views.md` | `v_showtime_seat_map` / `v_showtime_availability` are for "any authenticated user" | Both readings are public (DDR-015) — availability is catalogue data, auth begins at seat selection        | `showtimes.controller.ts`                             |
| `docs/database/views.md` | `total_seats` is never needed outside a specific showtime's availability           | `GET /halls` returns `totalSeats` per hall (DDR-015)                                                      | `halls.service.ts`                                    |
| `docs/api/README.md`     | `GET /halls` is `Bearer, admin`                                                    | Public (DDR-015); the API doc has been updated to match                                                   | `halls.controller.ts`                                 |

Each is also flagged in a blockquote at the foot of its own record. Resolve them either way —
change the code, or supersede the record — but do not leave them silently disagreeing.

## Not yet built

Records that are accepted but have no code behind them yet. This is expected; the branch is
the application skeleton over a designed schema.

| Record           | Waiting on                                                                    |
| ---------------- | ----------------------------------------------------------------------------- |
| ADR-007          | `seat_holds` table and the `uq_seat_hold_active` partial unique index         |
| ADR-008          | State-machine guards for seat hold and reservation (showtimes done — DDR-016) |
| ADR-009          | `@nestjs/schedule` — the 60-second sweep and 15-minute completion job         |
| ADR-010          | `status` flags and their transitions on Seat Holds and Reservations           |
| ADR-011, DDR-010 | Reports module and the aggregate queries                                      |
| DDR-001–004      | Reservations module (`POST /showtimes/:id/hold` lands there — DDR-015)        |

## Notes

- **Ownership checks (ADR-006, BR-34).** Wired up for real in the Users module (DDR-012) and
  now the Movies/Genres module (DDR-014) — `JwtAuthGuard`, `RolesGuard` and `@Roles()` gate
  the admin-only routes on `GenresController`/`MoviesController`; `@CurrentUser()` is used
  optionally there too, via the new `OptionalJwtAuthGuard`, to let an admin's token reveal
  inactive movies on the otherwise-public list/detail routes. Reservations/Showtimes still
  have no controllers or services; wiring ownership checks into `ReservationsService` remains
  deferred to when that module is actually built.
  Showtimes now has both (DDR-015), but every route on it is either public or admin-only, so
  no per-row ownership check arises there — the first one is `POST /showtimes/:id/hold`.
- **ADR-009's absence is compensated, not ignored.** With no expiry sweep, expired `held`
  rows stay in `seat_holds`. `findSeatOccupancyRows` requires `held_until > NOW()` in its
  join condition, so an expired hold reads as an available seat and cannot silently block a
  booking. The rows still accumulate; only the reads are protected. When the sweep lands, the
  predicate stays — it costs nothing and keeps the read correct between sweeps.
- **The seed's `DDR-009` row is gone from "Not yet built".** The seed exists at
  `src/database/seed/` and runs on application bootstrap; the old entry was stale.
- **Refresh token reuse detection.** ADR-005/BR-32 are satisfied by rotation + revocation.
  Detecting _reuse_ of an already-revoked token as a theft signal (and revoking the rest of
  that user's sessions in response) was considered and deliberately deferred — it needs a
  schema change (tracking token lineage) beyond what either record asks for.

## Keeping this current

Re-check when a module lands, and when a record is added or superseded. The
`/decision-record` skill reminds you to update this file.

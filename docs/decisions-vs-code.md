# Decisions vs. code

What the records say against what is committed on this branch. Keep this table honest — an
ADR that quietly disagrees with the code is worse than no ADR.

Last checked: 26 Aug 2026, on `feat/ticket-reservation` (`POST /showtimes/:id/hold` and the
seat-hold expiry sweep landed).

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
| ADR-007 | `src/modules/reservations/seat-holds.service.ts`, `seat-holds.controller.ts` — `POST /showtimes/:id/hold`; a `23505` on `uq_seat_hold_active` is caught and returned as `409 SEAT_UNAVAILABLE`                                                          |
| ADR-009 | `src/modules/reservations/seat-hold-sweep.service.ts` — `@nestjs/schedule`, `EVERY_MINUTE` cron releasing expired holds (BR-27). The 15-minute reservation-completion job is not built (see "Not yet built")                                            |
| DDR-001 | `src/modules/reservations/entities/seat-hold.entity.ts` (10-minute `held_until` DB default), `seat-hold-sweep.service.ts` (60s sweep cadence)                                                                                                           |

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

| Record           | Waiting on                                                                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-008          | State-machine guards for seat hold and reservation (showtimes done — DDR-016; seat-hold creation and the sweep only ever perform the two legal transitions into HELD/EXPIRED, so no guard has been needed yet) |
| ADR-009          | The 15-minute reservation-completion job — the 60-second seat-hold sweep is built (see above)                                                                                                                  |
| ADR-010          | `status` flags and their transitions on Seat Holds and Reservations                                                                                                                                            |
| ADR-011, DDR-010 | Reports module and the aggregate queries                                                                                                                                                                       |
| DDR-002, DDR-004 | Reservation confirmation itself (`POST /reservations`) — the pessimistic-lock transaction and reference-number format; `POST /showtimes/:id/hold` (DDR-001) is now built                                       |

## Notes

- **Ownership checks (ADR-006, BR-34).** Wired up for real in the Users module (DDR-012), the
  Movies/Genres module (DDR-014) — `JwtAuthGuard`, `RolesGuard` and `@Roles()` gate the
  admin-only routes on `GenresController`/`MoviesController`; `@CurrentUser()` is used
  optionally there too, via `OptionalJwtAuthGuard`, to let an admin's token reveal inactive
  movies on the otherwise-public list/detail routes — and now Reservations: every route on
  `ShowtimesController` is public or admin-only, so `SeatHoldsController`
  (`POST /showtimes/:id/hold`) is the first per-row ownership-relevant write in the flow.
  `userId` comes from `@CurrentUser()`, never the request body (BR-34/DDR-007). Ownership
  checks on `DELETE /seat-holds/:id` and `POST /reservations` remain deferred — those routes
  don't exist yet.
- **ADR-009 is now partially built.** The 60-second seat-hold sweep
  (`SeatHoldSweepService`) exists and flips expired `held` rows to `expired` (BR-27).
  `findSeatOccupancyRows`'s `held_until > NOW()` join condition stays regardless — a hold can
  still be up to a minute stale before the next sweep tick, and the read path was always meant
  to be correct independent of the sweep having run. The 15-minute reservation-completion job
  is not built; there is no `POST /reservations` yet for it to complete.
- **The seed's `DDR-009` row is gone from "Not yet built".** The seed exists at
  `src/database/seed/` and runs on application bootstrap; the old entry was stale.
- **Refresh token reuse detection.** ADR-005/BR-32 are satisfied by rotation + revocation.
  Detecting _reuse_ of an already-revoked token as a theft signal (and revoking the rest of
  that user's sessions in response) was considered and deliberately deferred — it needs a
  schema change (tracking token lineage) beyond what either record asks for.

## Keeping this current

Re-check when a module lands, and when a record is added or superseded. The
`/decision-record` skill reminds you to update this file.

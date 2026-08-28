# Decisions vs. code

What the records say against what is committed on this branch. Keep this table honest — an
ADR that quietly disagrees with the code is worse than no ADR.

Last checked: 28 Aug 2026, on `feat/ticket-reservation` (reservation confirmation, cancellation,
the 15-minute completion sweep, and the Reports module landed).

## Implemented and matching

| Record  | Where                                                                                                                                                                                                                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-001 | `src/app.module.ts`, `src/modules/` — one Nest app, modules registered at root                                                                                                                                                                                                                                          |
| ADR-002 | `src/database/data-source.options.ts` — `type: 'postgres'`                                                                                                                                                                                                                                                              |
| ADR-003 | `package.json` — `typeorm`, `@nestjs/typeorm`; migrations under `src/database/migrations/`                                                                                                                                                                                                                              |
| ADR-004 | `src/main.ts` — `NestFactory.create(AppModule)` with no adapter, i.e. Express                                                                                                                                                                                                                                           |
| ADR-005 | `src/modules/auth/` — bcrypt, RS256 JWT access token, SHA-256-hashed refresh tokens                                                                                                                                                                                                                                     |
| ADR-006 | `src/common/decorators/roles.decorator.ts`, `src/common/guards/roles.guard.ts`                                                                                                                                                                                                                                          |
| ADR-010 | `src/modules/users/`, `src/modules/movies/` — `is_active` flag + soft-delete `remove()`; `src/modules/showtimes/showtimes.service.ts` — `remove()` moves `status` to `cancelled`; `ReservationsService`/`SeatHoldSweepService`/`ReservationCompletionSweepService` now cover the Reservations/SeatHolds transitions too |
| ADR-012 | `src/main.ts` — `SwaggerModule` at `${apiPrefix}/docs`, URI versioning                                                                                                                                                                                                                                                  |
| ADR-014 | `docker-compose.yml`, `docker-compose.override.yml`, `Dockerfile`, `.env.example` — `app` and `postgres` now start together; migrations run on container start (`docker-entrypoint.sh`/`docker-entrypoint.dev.sh`); seed data already ran on `SeedService.onApplicationBootstrap`                                       |
| DDR-006 | `src/common/filters/all-exceptions.filter.ts` — `{ statusCode, errorCode, message, timestamp }`                                                                                                                                                                                                                         |
| DDR-008 | `src/config/env.validation.ts` — Joi schema, `abortEarly: false`, boot-time failure                                                                                                                                                                                                                                     |
| DDR-011 | `src/common/dto/pagination-query.dto.ts` — one-indexed pages, supersedes DDR-005                                                                                                                                                                                                                                        |
| DDR-012 | `src/modules/users/users.controller.ts`, `users.service.ts` — endpoint/permission design                                                                                                                                                                                                                                |
| DDR-013 | `src/modules/users/users.controller.ts` — `PATCH /users/me/password`                                                                                                                                                                                                                                                    |
| DDR-014 | `src/modules/movies/genres.controller.ts`, `genres.service.ts`, `movies.controller.ts`, `movies.service.ts` — endpoint/permission design                                                                                                                                                                                |
| ADR-013 | `src/database/migrations/1787211926318-InitSchema.ts` — every FK indexed, plus the composite paths ADR-013 names                                                                                                                                                                                                        |
| DDR-003 | `src/modules/showtimes/showtimes.service.ts` — `findSeatOccupancyRows` is the one derivation behind both the seat map and the availability triple; no counter column exists                                                                                                                                             |
| DDR-015 | `src/modules/showtimes/halls.controller.ts`, `halls.service.ts`, `showtimes.controller.ts`, `showtimes.service.ts` — endpoint/permission design                                                                                                                                                                         |
| DDR-016 | `src/modules/showtimes/showtimes.service.ts` — `ALLOWED_TRANSITIONS`, `assertStatusTransition`, `assertModifiable`                                                                                                                                                                                                      |
| ADR-007 | `src/modules/reservations/seat-holds.service.ts`, `seat-holds.controller.ts` — `POST /showtimes/:id/hold`; a `23505` on `uq_seat_hold_active` is caught and returned as `409 SEAT_UNAVAILABLE`                                                                                                                          |
| ADR-008 | `src/modules/reservations/reservations.service.ts` — `confirmReservation` (HELD→CONFIRMED), `cancel` (CONFIRMED→CANCELLED, and the held's own CONFIRMED→RELEASED); `reservation-completion-sweep.service.ts` (CONFIRMED→COMPLETED); `seat-hold-sweep.service.ts` (HELD→EXPIRED)                                         |
| ADR-009 | `src/modules/reservations/seat-hold-sweep.service.ts` (60s, BR-27) and `reservation-completion-sweep.service.ts` (15-min, `'0 */15 * * * *'` — no `CronExpression.EVERY_15_MINUTES` constant exists) — both jobs now built                                                                                              |
| DDR-001 | `src/modules/reservations/entities/seat-hold.entity.ts` (10-minute `held_until` DB default), `seat-hold-sweep.service.ts` (60s sweep cadence)                                                                                                                                                                           |
| DDR-002 | `src/modules/reservations/reservations.service.ts` — `confirmReservation`: lock the holds (`pessimistic_write`), re-validate (`SEAT_HOLD_NOT_OWNED`/`SEAT_HOLD_EXPIRED`), then write — the exact DDR-002 order                                                                                                          |
| DDR-004 | `src/modules/reservations/utils/reference-number.util.ts` plus `withReferenceRetry` in `reservations.service.ts` — retries the whole confirmation attempt (not a `SAVEPOINT`) on a `23505`, regenerating both the reservation and ticket numbers                                                                        |
| ADR-011 | `src/modules/reports/reports.service.ts` — `getRevenueReport`/`getCapacityReport`/`getReservationsReport`, each a `GROUP BY`/`COUNT`/`SUM` query builder against indexed columns, no summary table                                                                                                                      |
| DDR-010 | `src/modules/reports/reports.service.ts` — `getRevenueReport` filters `ticket.status = 'valid' AND reservation.status != 'cancelled'`, the exact DDR-010 predicate                                                                                                                                                      |

## Diverging — needs a fix or a superseding record

| Record                   | Says                                                                               | Code does                                                                                                                                                                                             | Where                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| DDR-007                  | `forbidNonWhitelisted` deliberately **off**                                        | `forbidNonWhitelisted: true`                                                                                                                                                                          | `src/app.module.ts`                                                         |
| `docs/database/views.md` | Defines six database views                                                         | **None of them exist** — no `CREATE VIEW` anywhere; all six are rebuilt as query builders (two in Showtimes, three in Reports; `v_reservation_summary`'s logic is inlined into `ReservationsService`) | `1787211926318-InitSchema.ts`, `showtimes.service.ts`, `reports.service.ts` |
| `docs/database/views.md` | `v_showtime_seat_map` / `v_showtime_availability` are for "any authenticated user" | Both readings are public (DDR-015) — availability is catalogue data, auth begins at seat selection                                                                                                    | `showtimes.controller.ts`                                                   |
| `docs/database/views.md` | `total_seats` is never needed outside a specific showtime's availability           | `GET /halls` returns `totalSeats` per hall (DDR-015)                                                                                                                                                  | `halls.service.ts`                                                          |
| `docs/api/README.md`     | `GET /halls` is `Bearer, admin`                                                    | Public (DDR-015); the API doc has been updated to match                                                                                                                                               | `halls.controller.ts`                                                       |

Each is also flagged in a blockquote at the foot of its own record. Resolve them either way —
change the code, or supersede the record — but do not leave them silently disagreeing.

## Not yet built

Records that are accepted but have no code behind them yet. This is expected; the branch is
the application skeleton over a designed schema.

| Record | Waiting on                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| —      | `DELETE /seat-holds/:id` (voluntary release, `docs/api/README.md`) — the only endpoint left undocumented as _Planned_ |

## Notes

- **Ownership checks (ADR-006, BR-34).** Wired up for real in the Users module (DDR-012), the
  Movies/Genres module (DDR-014), and now Reservations end to end: `SeatHoldsController`
  (`POST /showtimes/:id/hold`) and `ReservationsController` (`POST /reservations`,
  `GET /reservations/:id`, `POST /reservations/:id/cancel`) all take `userId`/`currentUser`
  from `@CurrentUser()`, never the request body. `GET /reservations/:id` is owner-or-admin;
  `POST /reservations/:id/cancel` is deliberately owner-only, matching
  `docs/api/README.md`'s "Auth: Bearer, owner" (no admin override) for that one route. Only
  `DELETE /seat-holds/:id` remains without an ownership check, since it doesn't exist yet.
- **ADR-009 is now fully built.** The 60-second seat-hold sweep (`SeatHoldSweepService`)
  flips expired `held` rows to `expired` (BR-27); `findSeatOccupancyRows`'s `held_until > NOW()`
  join condition stays regardless — a hold can still be up to a minute stale before the next
  sweep tick, and the read path was always meant to be correct independent of the sweep having
  run. `ReservationCompletionSweepService` now covers the 15-minute half, flipping `CONFIRMED`
  reservations to `COMPLETED` once their showtime has finished.
- **Nothing flips `showtimes.status` from `scheduled`/`active` to `completed` as real time
  passes** — `ShowtimesService`'s `ALLOWED_TRANSITIONS` only fires on an admin `PATCH`. Both
  `ReservationCompletionSweepService` (has this showtime finished?) and
  `ReservationsService.cancel` (BR-29 — has it started?) therefore compute the answer from
  `show_date`/`show_time`/`end_time` directly via two new `time.util.ts` helpers
  (`dateTimeToInstant`, `showtimeEndInstant`), rather than trusting `showtime.status`. Revisit
  if a job is ever added to advance `showtime.status` itself — at that point the two sources of
  truth should be reconciled rather than left to agree by construction.
- **Judgment call: reservation cancellation cascades to its tickets.** ADR-008/BR-24 mandate
  `CONFIRMED → CANCELLED` on the reservation and, as the only way to actually free the seats,
  `CONFIRMED → RELEASED` on its `seat_holds` (BR-17's index depends on it). Neither ADR-008 nor
  `business-rules.md`'s "State machine guards" table says anything about `tickets.status` on
  cancellation — `ReservationsService.cancel` flips `VALID → CANCELLED` there too, since leaving
  tickets permanently `valid` under a cancelled reservation makes BR-10's `cancelled` value dead
  code, and DDR-010's revenue query already filters on `reservation.status` alone so this has no
  effect on revenue correctness either way. Revisit if a future record says otherwise.
- **The seed's `DDR-009` row is gone from "Not yet built".** The seed exists at
  `src/database/seed/` and runs on application bootstrap; the old entry was stale.
- **Container images: one `production` target promoted through staging and production.**
  `Dockerfile` has two targets — `development` (hot reload, full deps, used via the
  auto-merged `docker-compose.override.yml`) and `production` (lean, compiled, non-root).
  Staging and production intentionally build and run the _same_ `production` image, differing
  only by env vars/secrets supplied at deploy time (`docker compose -f docker-compose.yml up`
  with an environment-specific `--env-file`), not by separate Dockerfile targets — this is the
  basis the future CI/CD pipeline should build on rather than re-deciding.
- **Refresh token reuse detection.** ADR-005/BR-32 are satisfied by rotation + revocation.
  Detecting _reuse_ of an already-revoked token as a theft signal (and revoking the rest of
  that user's sessions in response) was considered and deliberately deferred — it needs a
  schema change (tracking token lineage) beyond what either record asks for.

## Keeping this current

Re-check when a module lands, and when a record is added or superseded. The
`/decision-record` skill reminds you to update this file.

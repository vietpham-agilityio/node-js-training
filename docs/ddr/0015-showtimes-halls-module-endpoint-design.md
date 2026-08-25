# DDR-015 — Showtimes/Halls module endpoint design

Accepted · 25 Aug 2026 · Implements ADR-001, ADR-006, ADR-010, ADR-012

## Context

`src/modules/showtimes/` had `Hall`, `Seat` and `Showtime` entities and a module that
registered nothing else — no service, no controller, no DTOs. The schema was already
complete in `1787211926318-InitSchema.ts`, so the gap was the layer above it.

`docs/api/README.md` specified the endpoints as _Planned_, but left several things
undetermined: who may read a seat map, where the availability numbers come from given
DDR-003 forbids storing them, and how BR-28 (no overlapping showtimes in a hall) is
enforced when the only relevant index, `uq_showtimes_hall_date_time`, catches nothing
but an identical start time. This record fills in the rest, the way DDR-014 did for
Movies.

## Decision

- **The entire read surface is public.** `GET /halls`, `GET /showtimes`,
  `GET /showtimes/:id` and `GET /showtimes/:id/seats` all require no token. A customer
  browses the catalogue — including how many seats are left and which specific seats are
  taken — before deciding to book. Authentication begins at seat _selection_
  (`POST /showtimes/:id/hold`), which is where the first write happens.
- **`GET /showtimes/:id/seats` uses `OptionalJwtAuthGuard`**, satisfying DDR-014's
  follow-up. A token adds `isMine` to each seat; without one the field is **omitted
  entirely** rather than sent as `false`, because ownership is meaningless for a caller
  who has not identified themselves.
- **`GET /showtimes` and `GET /showtimes/:id` also use `OptionalJwtAuthGuard`**, deriving
  `includeCancelled` from `user?.role === UserRole.ADMIN` — DDR-014's
  public-but-richer-for-admin pattern, unchanged.
- **`GET /halls` is public and read-only.** Unpaginated (a cinema has a handful of halls
  and the caller needs all of them to read a showtime listing), returning
  `{id, name, hallType, totalSeats}`. There are no hall or seat mutation routes;
  `HallsService.remove` throws `MethodNotAllowedException` because
  `BaseAbstractService` forces a body for it.
- **Seat holds are read through the `Showtime.seatHolds` relation, never an injected
  `SeatHold` repository**, and `ShowtimesModule` does not import `ReservationsModule`.
- **`ShowtimesModule` does import `MoviesModule`** for the `Movie` repository, which
  BR-28 needs to compute `end_time` from `duration_minutes`.
- **BR-28 is an application guard inside the write transaction**, throwing
  `409 SHOWTIME_OVERLAP`, layered as: a per-hall `pg_advisory_xact_lock`, then the
  interval scan, then a `23505` catch translating a unique violation into the same code.
- **"Another _active_ showtime" in BR-28 is read as "not cancelled"** — `scheduled`,
  `active` and `completed` all block a new booking.
- **No turnaround buffer.** Intervals are half-open `[show_time, end_time)`, so a
  showtime may start exactly when the previous one ends.
- **The overlap scan covers `show_date ± 1 day`**, and a movie of 1440 minutes or more is
  rejected outright as unschedulable.
- **`POST /showtimes/:id/hold` is deliberately not implemented here.** It writes
  `seat_holds`, which `ReservationsModule` owns; it lands with ADR-007/DDR-002.

## Why

- **Public reads, auth at selection.** Requiring a token to see remaining seats would put
  a login wall in front of the one question every browsing customer asks. Nothing in the
  seat map is customer-specific — `docs/database/views.md`'s own `v_showtime_seat_map`
  exposes seat status with no per-user filter — so there is nothing to protect until the
  user tries to claim something. That is also the first point at which a row gets written
  and BR-34 ownership starts to matter.
- **`isMine` omitted rather than `false` for anonymous callers.** `false` asserts "this
  seat is not yours", which is not something the server can say about a caller it cannot
  identify. Omitting the key makes the distinction visible in the payload, and matches the
  `isMine?` the API document already published.
- **Relation join over an injected `SeatHold` repository.** ADR-001 forbids a module
  reaching into another module's repositories. `Showtime` already declares
  `@OneToMany(() => SeatHold)`, so the join uses metadata this module's own entity owns
  and touches no `ReservationsModule` provider. The decisive point is structural:
  Reservations will need `Showtime` and `Seat` when it is built, so importing
  `ReservationsModule` here would create a circular module import requiring `forwardRef`
  — permanent debt bought for a read-only join. `MoviesModule` has no such problem, since
  Movies has no need of Showtimes, so importing it outright is the honest way to reach
  `Movie` rather than going behind the module system via `EntityManager`.
- **The occupancy predicate lives in the JOIN condition.** `hold.status = 'confirmed' OR
(hold.status = 'held' AND hold.held_until > NOW())` is exactly the condition
  `uq_seat_hold_active` is written against (ADR-008), so at most one hold row can join per
  `(showtime, seat)` and a `COUNT` cannot be inflated — no `DISTINCT` needed. It also
  compensates for a gap: ADR-009's 60-second expiry sweep does not exist yet
  (`@nestjs/schedule` is not installed), so expired holds sit in the table unswept.
  Requiring `held_until > NOW()` in the join makes them fail to join and correctly read as
  available, which means the seat map is right whether or not the sweep ever runs.
- **One derivation for both readings (DDR-003).** `findSeatOccupancyRows` returns one row
  per active seat; the seat map maps those rows directly and `findAvailability` reduces
  the same rows into `{totalSeats, seatsTaken, availableSeats}`. A page of showtimes costs
  two queries, not N+1, and the two numbers can never disagree because they are the same
  rows counted once.
- **Anchored minute arithmetic for the overlap test.** `end_time` is stored wrapped
  (`% 24`), so a 23:00 start with a 150-minute movie persists `01:30:00` against the same
  `show_date` while genuinely occupying the next day. Comparing the stored strings would
  miss every overlap that crosses midnight. Converting both intervals to minute offsets
  anchored on the candidate's date, and recovering the true length with
  `durationBetweenTimeStrings`, makes the wrap invisible to the comparison — which is why
  the scan must reach a day either side, and why a movie spanning a full day has to be
  refused for the window to remain sound.
- **Advisory lock plus `23505`.** The interval check is read-then-write, so two concurrent
  admin writes can both see a free slot; row locks do not help because the conflicting row
  does not exist yet. `pg_advisory_xact_lock` on the hall serialises only writes into that
  hall, which costs nothing given how rare admin scheduling is. The `23505` catch is the
  backstop for the one case a lock cannot lose: an exact duplicate slot, which is the
  degenerate overlap, hence the same error code.
- **"Active" as "not cancelled".** Read literally, BR-28 would let a `scheduled` showtime
  be double-booked, since only a running one would block. That is plainly not the intent.
  Including `completed` prevents backfilling a slot that has already run.

## Rejected

- **Requiring a token for the seat map** — rejected: puts a login wall in front of ordinary
  browsing, and protects data that is not customer-specific.
- **Sending `isMine: false` to anonymous callers** — rejected: states something about the
  caller that the server cannot know.
- **Importing `ReservationsModule` to inject the `SeatHold` repository** — rejected: buys a
  `forwardRef` cycle the moment Reservations needs `Showtime`, for a read the entity
  relation already permits.
- **Reading `Movie` through `EntityManager` instead of importing `MoviesModule`** —
  rejected: same coupling, but hidden from the module graph.
- **A Postgres `EXCLUDE USING gist` constraint for BR-28** — rejected for now: it needs the
  `btree_gist` extension and a migration, and BR-28 names an application guard. Revisit if
  concurrent scheduling ever becomes common.
- **A turnaround buffer between showtimes** — rejected: nothing in the rules specifies one,
  and inventing a number would be a scheduling policy, not an implementation detail.
- **A `GROUP BY` aggregate for the list's availability numbers** — rejected while the page
  cap is 100: the per-seat rows are needed for the seat map anyway, and one derivation used
  twice is worth more than one query saved.

## Consequences

| Gains                                                                                                                                       | Costs accepted                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A customer can browse halls, showtimes and the exact seat map with no account at all; the login prompt appears only when they claim a seat. | `GET /halls` is public where `docs/api/README.md` said admin-only — a divergence that had to be written down rather than silently absorbed.                 |
| The seat map is correct with or without ADR-009's expiry sweep, so the sweep can land later without changing any read path.                 | Expired holds accumulate in `seat_holds` until that sweep exists; only the reads are protected, not the table's size.                                       |
| Availability and the seat map are derived from one query shape, so they cannot drift apart.                                                 | A page of 100 showtimes materialises ~4,800 rows — inside DDR-003's stated budget, but the thing to watch if the page cap ever rises.                       |
| Overlaps that cross midnight are caught, which the unique index alone would never have done.                                                | The overlap check is minute arithmetic in application code, not a constraint — a direct `INSERT` bypassing the service can still create an overlapping row. |

## Follow-up

- `POST /showtimes/:id/hold` and `SHOWTIME_NOT_BOOKABLE` land with the Reservations chunk.
- Changing a movie's `durationMinutes` leaves every existing showtime's `end_time` stale.
  Either `MoviesService` recomputes downstream showtimes, or `durationMinutes` becomes
  immutable once showtimes reference the movie. Not addressed here.
- The six views in `docs/database/views.md` do not exist in the database; `v_showtime_seat_map`
  and `v_showtime_availability` are reproduced as a query builder. Either add a views
  migration or supersede that document — see `decisions-vs-code.md`.

## Revisit if

Concurrent showtime scheduling stops being rare, or a direct-`INSERT` path into `showtimes`
appears — at which point the advisory lock is no longer sufficient and the exclusion
constraint rejected above should be reconsidered.

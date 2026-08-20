# DDR-003 — Computed seat availability instead of a stored counter

Accepted · 14 Aug 2026 · Implements ADR-011

## Context

A showtime could store a running count of remaining seats, decremented on each reservation.
Counters like this drift: a failed rollback, a manual fix, or a cancellation path that
forgets to increment leaves the number disagreeing with reality, silently.

Because admins report on capacity, a number that can drift would quietly corrupt every
report built on it.

## Decision

**Do not store availability.** Derive it: hall capacity minus the count of holds for that
showtime whose status is HELD or CONFIRMED. The seat map and the occupancy report use the
same derivation.

## Why

- A derived value cannot drift — correctness stops being something every future code path
  must remember.
- The count is an indexed aggregate over a small number of rows per showtime, so it is fast.
- The seat map already needs the individual hold rows to show which seats are taken, so the
  count adds no extra query.
- Cancellation becomes simpler: releasing a hold is a status change, with no counter to put
  back.

## Rejected

- **A stored counter** — fast to read, but every write path must maintain it correctly, and
  when it goes wrong it does so silently.
- **A counter plus a nightly reconciliation job** — a job whose only purpose is to repair a
  problem the design created.

## Consequences

| Gains                                                    | Costs accepted                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| The seat map and the capacity report can never disagree. | Each availability read runs an aggregate rather than reading one column.        |
| No class of "the numbers are wrong" bug.                 | Sorting many showtimes by remaining seats in one query would be more expensive. |
| Fewer mutable fields, so fewer ways to corrupt state.    |                                                                                 |

## Follow-up

- Add the composite index `seat_holds(showtime_id, status)`.
- Expose availability through one shared method used by both the seat map and reporting.

## Revisit if

A listing ever needs remaining availability across hundreds of showtimes at once.

Related: [`v_showtime_availability`](../database/views.md)

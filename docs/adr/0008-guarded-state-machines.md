# ADR-008 — Guarded State Machines for Seat Hold and Reservation

Accepted · 14 Aug 2026 · Related: ADR-007, DDR-001

## Context

A seat hold and a reservation each move through a small set of states, and only some
transitions are legal. The rule that only upcoming reservations may be cancelled is a
requirement, not a nicety, and the partial unique index in ADR-007 depends on precisely
which hold states count as occupying a seat.

## Decision

Model both explicitly, with guards rejecting illegal transitions.

| Entity      | Transitions                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| Seat hold   | HELD -> CONFIRMED / RELEASED / EXPIRED; CONFIRMED -> RELEASED (on cancellation) |
| Reservation | CONFIRMED -> CANCELLED (only while the showtime has not started); -> COMPLETED  |

A seat is occupied while its hold is HELD or CONFIRMED — the exact condition the ADR-007
index is written against.

## Consequences

- The definition of an occupied seat lives in one place and is enforced by the index that
  depends on it.
- The "only upcoming reservations" requirement is enforced by a guard rather than by a check
  someone must remember to write.
- Illegal transitions fail loudly instead of silently corrupting the state.
- A little more code than a plain status column that anything may update.

## Rejected

- **A plain status string updated wherever convenient** — nothing prevents an illegal
  transition, and the cancellation rule would be duplicated at each call site.
- **A boolean flag on holds** — cannot distinguish an expired hold from a released one,
  which the sweep job and reporting both need.

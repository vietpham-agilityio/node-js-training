# ADR-007 — Two-Layer Seat Locking: TTL Hold plus Partial Unique Index

Accepted · 14 Aug 2026 · Related: ADR-002, ADR-009, DDR-001, DDR-002

## Context

This is the central problem the system exists to solve. Two customers must never be sold the
same seat, including when their requests arrive at the same instant.

A seat must also be reservable in a way that gives the customer time to complete the
reservation without locking the seat away permanently if they abandon it.

## Decision

Two layers.

**First**, selecting seats creates a hold row per seat with a ten-minute expiry, giving that
customer an exclusive window.

**Second**, a partial unique index makes a conflicting active hold impossible at the
database level.

```sql
CREATE UNIQUE INDEX uq_seat_hold_active
ON seat_holds (showtime_id, seat_id)
WHERE status IN ('held', 'confirmed');
```

A losing concurrent request fails on the constraint and is returned as `409 Conflict`.

## Consequences

- Double-booking is prevented by the database, not by application logic that could contain a
  bug.
- The guarantee holds even if the application is running as more than one process.
- The losing request gets an immediate, specific error, so the client can refresh the seat
  map rather than failing silently.
- Abandoned holds need a release mechanism, which is ADR-009.
- The index is PostgreSQL-specific, which reinforces ADR-002.

## Rejected

- **A counter of remaining seats with optimistic locking** — can stop the count going
  negative, but cannot stop two customers each believing they hold seat A5, because it is
  not tied to seat identity.
- **Locking the whole showtime for the duration of a reservation** — correct, but serialises
  every reservation for a popular showtime through one lock, with no safety gain over
  locking the specific seats.
- **Application-level checking only** ("is this seat taken?" then insert) — the classic race
  condition; the answer can change between the check and the insert.

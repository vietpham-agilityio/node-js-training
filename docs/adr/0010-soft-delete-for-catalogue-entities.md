# ADR-010 — Soft Delete for Catalogue Entities

Accepted · 14 Aug 2026 · Related: ADR-013

## Context

Admins can delete movies and showtimes. But those rows are referenced by reservations that
customers have made. Deleting a movie that has reservations would either break the foreign
key or, with cascading deletes, destroy reservation history.

## Decision

Deleting a catalogue entity sets a flag — `is_active = false` for movies and halls,
`status = cancelled` for showtimes — rather than removing the row. Public browsing filters
to active rows. Foreign keys from reservations use `ON DELETE RESTRICT` so an accidental
hard delete fails loudly.

## Consequences

- Reservation history can never be destroyed by a catalogue action.
- Admins can still remove a film from the customer-facing catalogue immediately.
- An accidental removal is undone by clearing the flag.
- Every public read must remember to filter on the flag; a missed filter shows retired
  content.

## Rejected

- **Hard delete with cascade** — would delete customers' reservations along with the movie.
- **Refusing to delete anything that has reservations** — an admin could then never retire a
  film that had ever been booked, which is the normal case.

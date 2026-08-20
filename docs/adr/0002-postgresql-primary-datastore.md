# ADR-002 — PostgreSQL as Primary Datastore

Accepted · 14 Aug 2026 · Related: ADR-007

## Context

The data is strongly relational — seats belong to halls, showtimes reference movies and
halls, reservations reference showtimes and users. The reservation flow needs strict
concurrency control.

## Decision

Use PostgreSQL as the single database for all data.

## Consequences

- Partial unique indexes are available, which is what makes the overbooking guarantee in
  ADR-007 expressible.
- Row-level locking (`SELECT ... FOR UPDATE`) supports the reservation transaction.
- Foreign keys and check constraints let the schema enforce business rules directly.
- Requires running a database container locally, handled by Docker Compose (ADR-014).

## Rejected

- **MySQL** — a capable relational database, but it does not support partial (filtered)
  unique indexes, and the overbooking guarantee depends on one.
- **MongoDB** — the domain is relational, and the guarantees needed here come free in a
  relational engine but must be hand-built on a document store.

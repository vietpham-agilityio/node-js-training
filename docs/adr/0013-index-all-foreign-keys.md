# ADR-013 — Index All Foreign Keys

Accepted · 14 Aug 2026 · Related: ADR-010, ADR-011

## Context

PostgreSQL creates an index for a primary key but not for the referencing side of a foreign
key. Unindexed foreign keys turn ordinary joins into sequential scans, which is felt most in
exactly the reporting queries this system needs.

## Decision

Index every foreign key column, plus the composite indexes the known access paths need:
showtimes by date, seat holds by showtime and status, reservations by user and status.

## Consequences

- Joins and lookups stay predictable as data grows.
- The reporting queries in ADR-011 are index-supported rather than full scans.
- The seat-hold expiry sweep is an indexed range scan, so it is cheap to run every minute.
- Indexes cost a little write throughput and storage — an easy trade for this read-heavy
  workload.

## Rejected

- **Adding indexes reactively when something feels slow** — the access paths are already
  known from the design, so waiting means discovering the cost in a demo.

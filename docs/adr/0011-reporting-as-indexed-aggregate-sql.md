# ADR-011 — Reporting as Indexed Aggregate SQL

Accepted · 14 Aug 2026 · Related: ADR-013, DDR-003

## Context

Admins need to see all reservations, capacity and revenue. These require aggregating across
reservations, tickets, seats and showtimes.

## Decision

Compute reports with aggregate SQL executed by the database — `GROUP BY`, `SUM`, `COUNT` —
against indexed columns. Occupancy is derived from the same source as live seat
availability, so the two cannot disagree.

## Consequences

- Report response time does not grow linearly with reservation count, because only the
  aggregated result crosses the wire.
- Occupancy in a report always matches the seat map, since both derive from the same rows.
- Reports run against the same database serving reservations, so a very heavy report
  competes with live traffic — acceptable at this scale.
- Raw SQL for reports sits outside the ORM's types and must be kept in step with the schema
  by hand.

## Rejected

- **Loading rows into the application and summing them in TypeScript** — simple to write,
  but transfers every matching row and degrades as data grows.
- **Maintaining running totals in a summary table** — fast to read, but the totals can drift
  from the rows they summarise, which is the problem DDR-003 exists to avoid.

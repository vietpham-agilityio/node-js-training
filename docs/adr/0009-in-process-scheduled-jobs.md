# ADR-009 — In-Process Scheduled Jobs for Seat-Hold Expiry

Accepted · 14 Aug 2026 · Related: ADR-007, DDR-001

## Context

A hold has an expiry, but nothing happens at that moment on its own. Something must release
expired holds so the seats become available again, and it must not depend on a client
happening to make a request.

## Decision

Run scheduled jobs inside the application using `@nestjs/schedule`. A job every sixty
seconds releases expired holds; a job every fifteen minutes marks reservations for finished
showtimes as completed.

## Consequences

- Expiry happens whether or not anyone is using the system, so seat availability and
  capacity reports stay accurate.
- No additional infrastructure — no broker, no worker process, no scheduler service.
- If the application were ever run as multiple instances, both would execute the job;
  harmless because it is idempotent, but wasteful.
- Correctness does not depend on the job: the reservation transaction re-checks expiry
  itself (DDR-002).

## Rejected

- **Relying on the client to trigger cleanup** — expiry would simply not happen when the
  system is idle, and capacity figures would drift.
- **A dedicated job queue such as BullMQ with Redis** — appropriate for heavy or distributed
  background work, but disproportionate for two periodic queries.
- **A database trigger or scheduled database job** — moves logic out of the application
  where it cannot be unit-tested or reviewed with the rest of the code.

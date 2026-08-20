# DDR-009 — Seed data for the initial admin and demo catalogue

Accepted · 14 Aug 2026 · Implements ADR-006, ADR-014

## Context

The requirements state that the initial admin is created using seed data, and that only an
admin may promote another admin. That combination means **no API route can create the first
admin** — otherwise anyone could.

Separately, an empty database cannot demonstrate anything. A reviewer starting the system
should be able to browse movies and reserve a seat immediately.

## Decision

A seed script run on startup creates one admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
environment variables, and a demo catalogue: two halls with generated seat grids, eight to
ten movies with genres, and a week of showtimes. The script is idempotent, so restarting does
not duplicate anything.

## Why

- Taking the admin credentials from configuration keeps them out of source control while
  still satisfying the seed-data requirement.
- No route can create an admin, so the promotion rule cannot be bypassed at the point where it
  would matter most.
- A populated catalogue means the reservation flow can be demonstrated the moment the system
  starts.
- Idempotence means the seed is safe to run on every startup rather than needing a separate
  manual step.

## Rejected

- **Hard-coding the admin password in the seed script** — puts a credential in the
  repository.
- **A one-time setup endpoint that creates the first admin** — a route that creates an
  administrator is exactly what the requirement forbids.
- **Seeding only the admin** — leaves a reviewer facing an empty system with nothing to
  reserve.

## Consequences

| Gains                                                  | Costs accepted                                               |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| The promotion rule holds with no exception path.       | The seed catalogue must be maintained as the schema changes. |
| The system is demonstrable immediately after starting. | Startup does slightly more work.                             |
| Credentials stay in configuration rather than in code. |                                                              |

## Follow-up

- Generate showtimes relative to the current date, so the demo data never becomes entirely in
  the past.
- Include at least one past showtime, so the "cannot cancel a past reservation" rule is
  demonstrable.

## Revisit if

The project is ever deployed somewhere that demo data should not exist.

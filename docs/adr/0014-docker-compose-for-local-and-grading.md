# ADR-014 — Docker Compose for Local Development and Grading

Accepted · 14 Aug 2026 · Related: ADR-002, DDR-009

## Context

The project must run on a reviewer's machine with as little setup as possible, and needs a
real PostgreSQL instance rather than an in-memory substitute.

## Decision

Provide a `docker-compose.yml` that starts the API and PostgreSQL together. Migrations and
seed data run on startup. A `.env.example` documents every required variable.

## Consequences

- The whole system starts with one command, so a reviewer never debugs an environment.
- The database is the same engine as production would use, so behaviour under test matches
  behaviour in use.
- Seed data means the system is demonstrable immediately rather than empty.
- Docker becomes a prerequisite for running the project.

## Rejected

- **Running Node and PostgreSQL directly on the host** — fewer prerequisites, but pushes
  version and setup problems onto whoever runs it.
- **SQLite for local development** — easy to start, but it lacks the partial unique index
  the design depends on, so local behaviour would differ from real behaviour in exactly the
  riskiest area.

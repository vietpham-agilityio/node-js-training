# ADR-001 — NestJS Modular Monolith

Accepted · 14 Aug 2026

## Context

The system needs authentication, catalogue management, scheduling, seat reservation and
reporting. The question is whether these live in one application or several.

Seat reservation is the deciding factor. Selling a seat requires the hold, the reservation
and its tickets to be written together, atomically, behind a database constraint.

## Decision

Build one NestJS application organised into modules: Auth, Users, Movies, Showtimes,
Reservations and Reports. Each module owns its entities and services; no module reaches
into another module's repositories.

## Consequences

- The reservation transaction stays in one process and one database, so the
  no-double-booking guarantee is a database guarantee rather than a coordination problem.
- One deployable to run, test and demonstrate.
- Module boundaries are enforced by convention and code review rather than by network
  separation, so discipline is required to keep them clean.
- If a part of the system ever genuinely needed independent scaling, it would have to be
  extracted first.

## Rejected

- **Microservices with a message broker** — splitting reservation from scheduling would
  replace an ACID transaction with a distributed saga and reintroduce the overbooking risk
  this system exists to prevent. Nothing in the requirements needs independent deployment
  or scaling.
- **A single file or layer-based structure** (all controllers together, all services
  together) — groups code by technical role rather than by business subject, which
  scatters a single feature across the codebase.

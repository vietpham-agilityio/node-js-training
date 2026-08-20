# CLAUDE.md

NestJS + TypeORM + PostgreSQL backend for the Movie Reservation System capstone. One
deployable, module-per-domain, over a schema designed across seven phases.

## Read the decision records before changing behaviour

Every non-obvious choice in this codebase already has a written reason. Before you argue with
one, read it.

| Area                                    | Record                                                            |
| --------------------------------------- | ----------------------------------------------------------------- |
| Framework, HTTP adapter, database, ORM  | [ADR-001–004](docs/adr/README.md)                                 |
| Auth, roles, ownership checks           | [ADR-005, ADR-006](docs/adr/README.md), DDR-007, DDR-009          |
| Seat locking and overbooking            | [ADR-007–009](docs/adr/README.md), DDR-001, DDR-002               |
| Soft delete, reporting, indexing        | [ADR-010, ADR-011, ADR-013](docs/adr/README.md), DDR-003, DDR-010 |
| API shape — pagination, errors, OpenAPI | [ADR-012](docs/adr/README.md), DDR-005, DDR-006                   |
| Schema, business rules, views           | [docs/database/](docs/database/README.md)                         |
| What is actually implemented            | [docs/decisions-vs-code.md](docs/decisions-vs-code.md)            |

**ADR vs DDR.** An ADR shapes the whole system and is expensive to reverse. A DDR is a value
or convention you could change this afternoon. No decision goes in both. Both logs are
append-only — never renumber, never delete; supersede instead.

When you make a decision worth recording, run `/decision-record`.

## The invariant that matters

Two customers must never be sold the same seat. That guarantee is a **database constraint**,
not application logic:

```sql
CREATE UNIQUE INDEX uq_seat_hold_active
ON seat_holds (showtime_id, seat_id)
WHERE status IN ('held', 'confirmed');
```

Anything touching `seat_holds`, `reservations` or `tickets` must preserve it. In particular:

- A seat is occupied while its hold is HELD or CONFIRMED — the exact condition the index is
  written against (ADR-008). Change the status vocabulary and you change the index.
- Reservation confirmation is one transaction in a fixed order: lock the holds with
  `pessimistic_write`, re-validate them, then write (DDR-002). Do not reorder it, and do not
  put a network call inside it.
- Never trust a client-supplied user id. Ownership is checked from the authenticated user
  inside the transaction (BR-34).
- Availability is computed, never stored (DDR-003). Do not add a counter column.

## Conventions

**Modules.** `src/modules/<domain>/` — Auth, Users, Movies, Showtimes, Reservations, Reports.
A module owns its entities and services; no module reaches into another's repositories
(ADR-001). Register new modules in `src/app.module.ts`.

**API surface.** URI versioning under a global `api` prefix, so routes resolve to
`/api/v1/<resource>`. Health is `VERSION_NEUTRAL`.

**Validation.** Global `ValidationPipe`. Fields a client must never control are simply absent
from the DTO — that is the mechanism, not a check you write (DDR-007, BR-33).

**Errors.** One global filter, one envelope. Business failures carry a stable `errorCode`
(DDR-006).

**Pagination.** Every list endpoint is paginated, capped at 100 server-side (DDR-005).

**Schema changes.** `synchronize` is off. Migration-managed:

```bash
pnpm run migration:generate src/database/migrations/AddSeatHolds
```

Index every foreign key you add (ADR-013).

## Commands

```bash
pnpm run start:dev
```

```bash
pnpm run lint && pnpm test
```

```bash
pnpm run db:up
```

Hooks run `lint-staged` on commit, `commitlint` on the message, and `tsc --noEmit` plus unit
tests on push. Commits follow Conventional Commits — run `/commit` to write one from the
staged diff and validate it before the hook sees it.

## Working agreements

- Match the surrounding code: same comment density, naming and idiom.
- When code and a record disagree, say so and pick one — do not silently follow the code.
  Log it in [docs/decisions-vs-code.md](docs/decisions-vs-code.md).
- Do not add a dependency that an ADR rejected without superseding that ADR first. Prisma,
  Fastify, Redis, a message broker and a third-party identity provider were all considered
  and turned down for stated reasons.
- Do not commit `.env`. Add new variables to both `src/config/env.validation.ts` and
  `.env.example` (DDR-008).

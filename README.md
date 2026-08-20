# Movie Reservation System — API

NestJS + TypeORM + PostgreSQL backend for the ticket reservation capstone. One deployable,
module per domain, over a schema designed across seven phases.

The system exists to solve one problem properly: **two customers must never be sold the same
seat.** Everything else — the catalogue, the schedule, the reports — is in service of that.

---

## Documentation

The design is written down, not folklore. Start here:

| Document                                               | What it holds                                             |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [docs/](docs/README.md)                                | Index, and how the layers cross-reference                 |
| [docs/adr/](docs/adr/README.md)                        | 14 Architecture Decision Records                          |
| [docs/ddr/](docs/ddr/README.md)                        | 10 Design Decision Records                                |
| [docs/database/](docs/database/README.md)              | 11 tables, 14 relationships, 34 business rules, 6 views   |
| [docs/decisions-vs-code.md](docs/decisions-vs-code.md) | What is implemented, what diverges, what is not built yet |
| [CLAUDE.md](CLAUDE.md)                                 | Working agreements and the invariants to preserve         |

---

## How overbooking is prevented

Two layers, decided in [ADR-007](docs/adr/0007-two-layer-seat-locking.md).

**Soft.** Selecting seats writes a `seat_holds` row per seat with a ten-minute expiry
([DDR-001](docs/ddr/0001-seat-hold-ttl-and-sweep-cadence.md)), giving that customer an
exclusive window. A job every sixty seconds releases expired holds
([ADR-009](docs/adr/0009-in-process-scheduled-jobs.md)).

**Hard.** A partial unique index makes a conflicting active hold impossible in the database:

```sql
CREATE UNIQUE INDEX uq_seat_hold_active
ON seat_holds (showtime_id, seat_id)
WHERE status IN ('held', 'confirmed');
```

Confirmation is one transaction in a fixed order — lock the holds with `pessimistic_write`,
re-validate them, then write the reservation and its tickets
([DDR-002](docs/ddr/0002-reservation-confirmation-transaction.md)). The losing concurrent
request gets a `409 Conflict`, not a corrupted seat map.

Availability is never stored. It is derived from the hold rows, so the seat map and the
capacity report cannot disagree
([DDR-003](docs/ddr/0003-computed-seat-availability.md)).

---

## Prerequisites

| Tool       | Version                                                     |
| ---------- | ----------------------------------------------------------- |
| Node.js    | 22+                                                         |
| pnpm       | 10+                                                         |
| PostgreSQL | 16+ (local install, or `pnpm run db:up` for the Docker one) |

---

## Getting started

```bash
pnpm install
```

```bash
cp .env.example .env
```

Fill in `.env`, then start the database and the API:

```bash
pnpm run db:up
```

```bash
pnpm run start:dev
```

- API — http://localhost:3000/api/v1
- Swagger UI — http://localhost:3000/api/docs
- Health probe — http://localhost:3000/api/health

A bad or missing environment variable fails the boot rather than the first request that needs
it ([DDR-008](docs/ddr/0008-configuration-and-logging.md)).

---

## Layout

```
src/
  main.ts                       bootstrap: helmet, CORS, prefix, versioning, Swagger
  app.module.ts                 root module — register domain modules here
  config/
    env.validation.ts           Joi schema; a bad env fails startup, not runtime
    app.config.ts               typed `app` namespace
  database/
    data-source.options.ts      connection options shared by Nest and the CLI
    data-source.ts              entry point for the TypeORM CLI
    database.module.ts          TypeOrmModule.forRootAsync
    migrations/                 generated migrations land here
  common/
    filters/                    AllExceptionsFilter — one JSON error shape
    dto/                        PaginationQueryDto and friends
  modules/
    health/                     Terminus probe with a database ping
docs/                           ADRs, DDRs, database design
.gitlab/merge_request_templates/  MR templates picked in the GitLab UI
```

Domain modules go under `src/modules/` and are registered in `app.module.ts` as each lands:

| Module         | Owns                                            | Records                      |
| -------------- | ----------------------------------------------- | ---------------------------- |
| `auth`         | Signup, login, refresh tokens                   | ADR-005, DDR-008             |
| `users`        | Profiles, roles, promotion                      | ADR-006, DDR-009, BR-33      |
| `movies`       | Movies, genres                                  | ADR-010, BR-30               |
| `showtimes`    | Halls, seats, schedule, seat map                | BR-28, `v_showtime_seat_map` |
| `reservations` | Seat holds, reservations, tickets, cancellation | ADR-007–009, DDR-001–004     |
| `reports`      | Revenue, occupancy, all reservations            | ADR-011, DDR-010             |

---

## Domain model

Eleven tables. Full field lists, delete rules and cardinality in
[docs/database/](docs/database/README.md).

```
users ──< refresh_tokens
users ──< seat_holds >── seats >── halls ──< showtimes >── movies >── movie_genres >── genres
users ──< reservations >── showtimes
reservations ──< tickets >── seats
reservations ──< seat_holds
```

Six views serve every count and total, because none of them is stored:
`v_showtime_seat_map`, `v_showtime_availability`, `v_reservation_summary`, `v_admin_revenue`,
`v_admin_showtime_occupancy`, `v_admin_all_reservations`. See
[docs/database/views.md](docs/database/views.md).

---

## Conventions

**API surface.** URI versioning under a global `api` prefix, so routes resolve to
`/api/v1/<resource>`. Health is `VERSION_NEUTRAL` — orchestrators get one stable URL.

**Validation.** A global `ValidationPipe` strips any property a DTO does not declare. Fields a
client must never control — `role`, `status`, prices — are simply absent from the DTO, which
is what makes privilege escalation structurally impossible rather than a check someone has to
remember ([DDR-007](docs/ddr/0007-dto-validation-strategy.md)).

**Errors.** One global filter, one envelope, a stable `errorCode` the client branches on
([DDR-006](docs/ddr/0006-error-response-shape.md)). 5xx bodies are generic; the stack goes to
the log.

**Pagination.** Every list endpoint takes `page` and `limit`, capped at 100 server-side
([DDR-005](docs/ddr/0005-pagination-convention.md)).

**Authorization.** `@Roles()` plus a `RolesGuard` at the route. Ownership is checked in
service code from the authenticated user id, never from client input
([ADR-006](docs/adr/0006-rbac-via-guards.md), BR-34).

**Deletion.** Catalogue entities are soft-deleted; foreign keys from reservations are
`ON DELETE RESTRICT` so an accidental hard delete fails loudly
([ADR-010](docs/adr/0010-soft-delete-for-catalogue-entities.md)).

**Schema changes.** `synchronize` is off. The schema is migration-managed, and every new
foreign key gets an index ([ADR-013](docs/adr/0013-index-all-foreign-keys.md)):

```bash
pnpm run migration:generate src/database/migrations/AddSeatHolds
```

```bash
pnpm run migration:run
```

---

## Scripts

| Script                                           | What it does                                  |
| ------------------------------------------------ | --------------------------------------------- |
| `pnpm run start:dev`                             | watch-mode dev server                         |
| `pnpm run build` / `start:prod`                  | compile to `dist/`, run the compiled app      |
| `pnpm run lint` / `lint:check`                   | ESLint with / without `--fix`                 |
| `pnpm run format` / `format:check`               | Prettier write / verify                       |
| `pnpm test` / `test:watch` / `test:cov`          | Jest unit tests                               |
| `pnpm run test:e2e`                              | end-to-end suite (needs a reachable database) |
| `pnpm run migration:generate\|run\|revert\|show` | TypeORM migrations                            |
| `pnpm run db:up` / `db:down` / `db:logs`         | Postgres via Docker Compose                   |

---

## Contributing

**Commits** follow [Conventional Commits](https://www.conventionalcommits.org), enforced by
commitlint through a husky `commit-msg` hook:

```
feat(reservations): hold seats for ten minutes
fix(auth): reject expired refresh tokens
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`. Scopes are free-form — use the module you touched.

**Hooks**, installed automatically by `pnpm install`:

| Hook         | Runs                                              |
| ------------ | ------------------------------------------------- |
| `pre-commit` | `lint-staged` — ESLint + Prettier on staged files |
| `commit-msg` | `commitlint`                                      |
| `pre-push`   | `tsc --noEmit` + unit tests                       |

To skip a hook in an emergency, `git commit --no-verify`.

Run `/commit` to generate a compliant message from the staged diff — it reads the staged
changes, picks the type and scope, and validates against `commitlint.config.js` before
committing.

**Merge requests** use the templates in `.gitlab/merge_request_templates/` — pick _Default_
or _Bugfix_ from the description dropdown when opening the MR. Both ask which decision records
the change touches; answer it rather than deleting the section.

**Decisions.** If a change settles something non-obvious, record it. Run `/decision-record`,
or copy `docs/adr/_template.md` / `docs/ddr/_template.md` by hand. Do not renumber or delete
an existing record — supersede it.

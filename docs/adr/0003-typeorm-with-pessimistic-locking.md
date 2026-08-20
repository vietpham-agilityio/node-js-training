# ADR-003 — TypeORM as ORM with Pessimistic Locking

Accepted · 14 Aug 2026 · Related: ADR-007, DDR-002

## Context

Data access needs to be typed and migrations need to be reviewable. Critically, the
reservation transaction needs row-level pessimistic locking expressed clearly in
application code.

## Decision

Use TypeORM with the `DataSource` transaction API. Locking uses the query builder's
`pessimistic_write` mode, which emits `SELECT ... FOR UPDATE`.

```ts
const holds = await manager
  .getRepository(SeatHold)
  .createQueryBuilder('h')
  .setLock('pessimistic_write')
  .where('h.id IN (:...ids)', { ids: holdIds })
  .getMany();
```

## Consequences

- The most safety-critical statement in the system is written in the query builder rather
  than in raw SQL, so it stays typed and readable.
- Decorator-based entities and migrations are the most widely documented pairing with
  NestJS.
- Entity definitions can drift from the actual schema; generated migrations and integration
  tests guard against this.
- Reporting queries still use raw SQL, where aggregate SQL reads more clearly than a query
  builder (ADR-011).

## Rejected

- **Prisma** — excellent generated types, but expressing `FOR UPDATE` requires dropping to
  raw SQL, which puts the most critical statement in the system outside the type system.
- **Raw SQL with the `pg` driver** — maximum control, but too much boilerplate for the
  timescale.

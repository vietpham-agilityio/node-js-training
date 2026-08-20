# DDR-002 — Reservation-confirmation transaction step order and locking

Accepted · 14 Aug 2026 · Implements ADR-003, ADR-007

## Context

Confirming a reservation writes several things that must all succeed or all fail: the
reservation, one ticket per seat, and the status change on each hold.

It also has to close the gap between the customer opening the confirmation screen and
actually confirming — during which their hold could expire, or the request could arrive
twice.

## Decision

One transaction, with a fixed order: **lock the holds, re-validate them, then write.**

```ts
await dataSource.transaction(async (manager) => {
  // 1. Lock this customer's holds — SELECT ... FOR UPDATE
  const holds = await manager
    .getRepository(SeatHold)
    .createQueryBuilder('h')
    .setLock('pessimistic_write')
    .where('h.id IN (:...ids)', { ids: holdIds })
    .andWhere('h.userId = :userId', { userId })
    .getMany();

  // 2. Re-validate: all present, still HELD, not expired
  if (holds.length !== holdIds.length)
    throw new ForbiddenException('Hold does not belong to you');
  if (holds.some((h) => h.status !== 'held' || h.heldUntil < new Date()))
    throw new ConflictException('One or more holds expired');

  // 3. Insert reservation, insert one ticket per seat
  // 4. Set holds to CONFIRMED
}); // COMMIT — or roll back everything
```

## Why

- Locking the specific hold rows closes the race without blocking anyone reserving different
  seats.
- Re-checking the expiry here means correctness never depends on the sweep job having run.
- Ownership is checked from the authenticated user id inside the transaction, never from a
  value the client sent.
- Validation comes before any write, so the common failures cost nothing and leave nothing
  behind.

## Rejected

- **Validating first and writing in a separate step** — reintroduces exactly the race this
  design exists to close.
- **Optimistic locking with retry** — retry storms would hit hardest on the busiest
  showtimes, which is when it matters most.
- **Locking the whole showtime** — correct, but serialises every reservation for that
  showtime through one lock.

## Consequences

| Gains                                                                                 | Costs accepted                                                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A partial reservation is impossible — every failure path leaves the system unchanged. | Locks are held for the duration of the transaction, so any slow step inside it would extend them. |
| Each failure case is directly unit-testable.                                          | The locking query is more verbose than a plain find.                                              |
| The database constraint from ADR-007 remains as an independent backstop.              |                                                                                                   |

## Follow-up

- Write a concurrency test firing parallel confirmations for the same seats and asserting
  exactly one succeeds — during implementation, not at the end.
- Unit-test the failure cases: expired hold, hold belonging to another user, hold already
  confirmed.

## Revisit if

A slow operation is ever added inside the transaction, particularly a call to an external
service, which would hold locks across a network call.

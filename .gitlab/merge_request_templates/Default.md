## What and why

<!-- One paragraph. What changes, and what it is for. Link the ticket. -->

Closes #

## Decision records touched

<!--
Which ADRs/DDRs this implements, or contradicts. If none, delete this section.
If this MR makes a decision worth recording, add the record in the same MR.
-->

- Implements: ADR-, DDR-
- Supersedes: —

## How to verify

<!-- Steps a reviewer can actually run. Not "tested locally". -->

1.
2.

## Checklist

- [ ] Commits follow Conventional Commits; the branch name matches the ticket
- [ ] `pnpm run lint:check` and `pnpm test` pass locally
- [ ] New env vars added to **both** `src/config/env.validation.ts` and `.env.example`
- [ ] Schema changes are a migration; `synchronize` still off; new foreign keys indexed (ADR-013)
- [ ] New list endpoints are paginated (DDR-005); new failures carry an `errorCode` (DDR-006)
- [ ] DTOs omit any field the client must not control (DDR-007, BR-33)
- [ ] `docs/decisions-vs-code.md` updated if this changes what is implemented
- [ ] No secrets, no `.env`, no commented-out code

## Seat-reservation impact

<!--
Delete this section if the MR does not touch seat_holds, reservations or tickets.
Otherwise answer all three.
-->

- Does this preserve the `uq_seat_hold_active` partial unique index (ADR-007, BR-17)?
- Does it change the DDR-002 transaction — its step order, its locking, or what runs inside it?
- Is there a concurrency test covering the change?

## Screenshots / output

<!-- Swagger, a curl response, a failing-then-passing test. Delete if not relevant. -->

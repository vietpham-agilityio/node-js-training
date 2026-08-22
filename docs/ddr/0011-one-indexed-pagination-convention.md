# DDR-011 — One-indexed pagination convention

Accepted · 22 Aug 2026 · Implements ADR-012 · Supersedes DDR-005

## Context

DDR-005 specified zero-indexed pages, but `src/common/dto/pagination-query.dto.ts` has always
shipped one-indexed (`page = 1` default, `skip = (page - 1) * limit`) — flagged as an open
divergence in `docs/decisions-vs-code.md` since the Auth module landed. No endpoint has
actually consumed the pagination envelope yet, but the abstract base CRUD service being built
now (`src/common/base/base-crud.service.ts`) is about to become the first real consumer, and
it needs to be built against a convention that isn't still disagreeing with itself.

## Decision

Pages are **one-indexed**. `page` defaults to `1`; `skip = (page - 1) * limit`. The response
envelope shape is unchanged from DDR-005:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 137, "hasMore": true }
}
```

## Why

- The code has been one-indexed since the DTO was first written, and nothing has ever
  consumed the zero-indexed version DDR-005 described — fixing the record costs nothing no
  client has to migrate.
- One-indexed pages match how every existing client-facing example in this repo's docs
  (`docs/adr`, `docs/ddr`) already talks about "page 1", and matches the everyday meaning of
  a page number a UI would display.
- Keeping `PaginationQueryDto` as-is avoids touching the one file every future list endpoint
  will depend on, right as four modules (Movies, Users, Showtimes, Reservations) are about to
  start using it.

## Rejected

- **Change the code to zero-indexed, per the original DDR-005 text** — would touch the one
  shared pagination DTO right as it's about to get its first real consumers, for a convention
  no client currently depends on either way. Zero-indexed pages are also less intuitive to
  display directly in a UI ("page 0 of 7").

## Consequences

| Gains                                                             | Costs accepted                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| The divergence between DDR-005 and the code is closed for good.   | `page=0` in a request now means "the same as page 1", not an error. |
| `PaginatedResponseDto` can be built against a settled convention. | —                                                                   |

## Follow-up

- None — `PaginationQueryDto` already implements this; no code change required.

## Revisit if

A client integration explicitly expects zero-indexed pages (e.g. reusing a shared
zero-indexed pagination component from another system).

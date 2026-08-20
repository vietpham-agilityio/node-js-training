# DDR-005 — Pagination convention for list endpoints

Accepted · 14 Aug 2026 · Implements ADR-012

## Context

Several endpoints return collections that grow without limit — a customer's reservations,
the movie list, and the admin view of all reservations. Returning everything would degrade
unpredictably as data accumulates.

## Decision

Every list endpoint accepts `page` and `limit`, **zero-indexed**, with `limit` capped at 100
on the server regardless of what is requested. Responses use one envelope.

```json
{
  "data": [],
  "meta": { "page": 0, "limit": 20, "total": 137, "hasMore": true }
}
```

## Why

- One envelope everywhere means the client writes one pagination implementation.
- The server-side cap protects the database no matter what the client asks for.
- Returning `total` and `hasMore` supports both "showing 20 of 137" and infinite scroll
  without another request.

## Rejected

- **No pagination** — the admin reservations list would grow until it became unusable.
- **Letting the client set an unlimited `limit`** — one request could pull the entire table.
- **Cursor-based pagination** — more robust at very large offsets, but more complex on the
  client and unnecessary at this scale.

## Consequences

| Gains                                         | Costs accepted                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| No endpoint can return an unbounded response. | A count query for `total` adds a second query per request.               |
| One client implementation covers every list.  | Rows can shift between pages if data changes while a customer is paging. |

## Follow-up

- Define the envelope once as a shared generic DTO so no endpoint drifts.
- Order every paginated query by a stable tiebreaker such as `created_at DESC, id`.

## Revisit if

Any listing routinely grows past a few thousand rows.

> **Code divergence.** `src/common/dto/pagination-query.dto.ts` is currently **one**-indexed
> (`page = 1`, `skip = (page - 1) * limit`). Either change the DTO or supersede this record.

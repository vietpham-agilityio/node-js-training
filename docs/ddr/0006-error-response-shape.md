# DDR-006 — Error response shape and global exception handling

Accepted · 14 Aug 2026 · Implements ADR-012

## Context

The reservation flow fails in several distinct ways the client must handle differently: the
seat was taken, the hold expired, the showtime has already started. If those arrive in
different shapes, the client is forced to match on message text.

## Decision

One global exception filter turns every error into the same shape. Business failures are
thrown from services as specific HTTP exceptions carrying a stable `errorCode`.

```json
{
  "statusCode": 409,
  "errorCode": "SEAT_UNAVAILABLE",
  "message": "Seat A5 is no longer available",
  "timestamp": "2026-08-14T10:32:00.000Z"
}
```

## Why

- A global filter guarantees the shape structurally — a new endpoint cannot return something
  different.
- `errorCode` gives the client something stable to branch on, so messages can be reworded or
  translated freely.
- Four fields is the smallest envelope that still does the job; the status line already
  carries the reason, and the client knows the URL it called.
- Throwing typed exceptions from services keeps error formatting out of controllers.

## Rejected

- **The NestJS default** — validation errors and thrown exceptions come out in different
  shapes.
- **Formatting errors in each controller** — duplicated, and easy to forget on a new
  endpoint.
- **Status codes alone** — 409 would mean both "seat taken" and "hold expired", which need
  different messages.

## Consequences

| Gains                                             | Costs accepted                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| The client implements one error handler.          | Each new business failure needs an `errorCode` chosen and documented.       |
| The envelope is small enough to read at a glance. | The client keeps its own copy of the code list, which can fall out of step. |

## Follow-up

- Define all `errorCode` values in one exported enum and surface them in Swagger.
- Log the full internal error server-side while returning only the sanitised envelope.

## Revisit if

A second API consumer appears with different error-handling needs.

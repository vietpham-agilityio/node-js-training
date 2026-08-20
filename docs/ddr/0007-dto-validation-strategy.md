# DDR-007 — DTO validation strategy

Accepted · 14 Aug 2026 · Implements ADR-006

## Context

Every write endpoint accepts JSON from the client. Without validation, malformed values reach
the database — and worse, a client could send fields it should not control. A signup that
could set `role: admin` would defeat the whole authorization model.

## Decision

A global `ValidationPipe` runs with `{ whitelist: true, transform: true }`. Every request
body is a DTO class with `class-validator` decorators. Fields the client must not control are
simply **absent from the DTO**, so any value sent for them is stripped before a service sees
it.

## Why

- `whitelist` is what prevents the privilege-escalation problem: a field not on the DTO is
  removed, so `role` can never be set by a client no matter what it sends.
- The protection is structural rather than a check someone must remember to write on each
  endpoint.
- `transform` means controllers receive typed instances, so the rest of the code can trust the
  types.
- `class-validator` decorators also generate the Swagger documentation, so rules and docs
  cannot drift.

## Rejected

- **Validating by hand in each service** — repetitive, and easy to forget on a new endpoint.
- **Leaving `whitelist` off** — unknown fields would reach the service, leaving privilege
  escalation open.
- **Adding `forbidNonWhitelisted`** — rejects the whole request when an extra field appears.
  Stricter than needed: stripping already solves the security problem, and this only turns a
  silent drop into a hard failure for a client sending something harmless.

## Consequences

| Gains                                                        | Costs accepted                                                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| A client cannot set its own `role`, no matter what it sends. | Every endpoint needs an explicit DTO class.                                                         |
| Swagger reflects the real validation rules automatically.    | A misspelled field name is dropped silently, so a client-side typo succeeds with the value ignored. |
| Services can trust their inputs.                             |                                                                                                     |

## Follow-up

- Use `PartialType` and `PickType` so create and update DTOs do not duplicate field
  definitions.
- Log stripped field names at debug level outside production, so a client typo is
  discoverable.
- Test that `role` sent by a client is stripped and never reaches the database.

## Revisit if

A third-party client is onboarded, where stricter rejection might be preferable to silent
stripping.

> **Code divergence.** `src/app.module.ts` currently registers the pipe with
> `forbidNonWhitelisted: true`, which this record explicitly rejected. Either change the code
> or supersede this record.

# DDR-004 — Reservation and ticket reference number format

Accepted · 14 Aug 2026

## Context

A customer needs a reference they can read aloud or search for. The primary key is a UUID,
which is unreadable over the phone, and a sequential number would reveal how many
reservations the cinema has taken and let anyone guess another customer's reference.

## Decision

A reservation reference is `RSV-{YYYYMMDD}-{6 characters}`, for example `RSV-20260814-7K2N9Q`.
A ticket reference is `TKT-{reservation suffix}-{seat sequence}`, for example `TKT-7K2N9Q-03`.
Both are generated with a retry against their unique constraint.

## Why

- The date prefix makes references sortable and immediately meaningful to staff.
- Six base-36 characters give billions of combinations per day, so guessing another reference
  is impractical.
- The unique constraint plus a retry makes a collision harmless rather than something to
  reason about.
- The ticket reference visibly belongs to its reservation, which helps when a customer reads
  one out.

## Rejected

- **Showing the UUID** — unique, but nobody can read it over a phone.
- **A sequential number** — readable, but reveals business volume and lets anyone enumerate
  other references.

## Consequences

| Gains                                                    | Costs accepted                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| Support conversations and demonstrations are far easier. | A rare extra database round trip when a generated reference collides. |
| References reveal nothing about volume.                  |                                                                       |

## Follow-up

- Generate the reference inside the reservation transaction so it is written atomically with
  the row.

## Revisit if

References ever need to encode a cinema or region.

Enforced as BR-21 and BR-22 — see [business rules](../database/business-rules.md).

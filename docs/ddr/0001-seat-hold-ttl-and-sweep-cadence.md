# DDR-001 — Seat-hold TTL duration and expiry sweep cadence

Accepted · 14 Aug 2026 · Implements ADR-007, ADR-009

## Context

ADR-007 decided that seats are held before a reservation is confirmed, and ADR-009 decided
that a scheduled job releases expired holds. Neither fixed the numbers: how long a hold
lasts, and how often the job runs.

These are two different things. A hold expiring and its seat becoming available again are
separate moments — the row still says `held` until something changes it.

## Decision

A hold lasts **ten minutes** from creation. A job runs every **sixty seconds** and releases
holds whose expiry has passed.

```text
10:00     customer holds seat A5      status = 'held'
10:10     hold expires                status = still 'held'
10:10:45  sweep job runs              status = 'expired' — seat available
```

The reservation transaction also re-checks the expiry itself (DDR-002), so a hold that has
run out can never be confirmed even if the job is late.

## Why

- Ten minutes comfortably covers completing a reservation on a phone without feeling rushed.
- A sixty-second sweep means a seat is falsely shown as unavailable for at most one extra
  minute.
- The sweep is an indexed range scan over holds where status is HELD, so running it every
  minute costs almost nothing.
- Because expiry is also checked inside the transaction, the job is an optimisation for what
  _other_ customers see — never a correctness requirement.

## Rejected

- **Five minutes** — frees seats faster, but is realistically too short for a first-time
  customer.
- **Twenty minutes** — generous, but a busy showtime would look sold out while holds sit
  abandoned.
- **No expiry at all** — a customer who closes the app would lock those seats permanently.
- **Sweeping every five minutes** — cheaper, but a seat could appear unavailable for five
  minutes after it was actually free.

## Consequences

| Gains                                                                                     | Costs accepted                                                                                 |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Abandoned selections free themselves within about a minute, with no operator involvement. | A customer on a very slow connection could lose their hold mid-reservation and must re-select. |
| Availability stays accurate even when nobody is using the system.                         | The values are constants rather than per-showtime settings.                                    |
| The customer gets a clear, predictable window.                                            |                                                                                                |

## Follow-up

- Expose the TTL as `SEAT_HOLD_TTL_MINUTES` with a ten-minute default, so tuning needs no
  code change.
- Add an index on `seat_holds(held_until)` filtered to `status = HELD`, so the sweep stays
  cheap.
- Return a distinct error code for an expired hold, so the client can say "your hold expired"
  rather than "seat taken".

## Revisit if

Customers routinely time out mid-reservation, or the system is ever run as more than one
instance — in which case the job would need duplicate-run protection.

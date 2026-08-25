# DDR-016 — Showtime status state machine

Accepted · 25 Aug 2026 · Implements ADR-008, ADR-010

## Context

BR-06 lists the four values `showtimes.status` may hold — `scheduled`, `active`,
`completed`, `cancelled` — but says nothing about which may follow which. ADR-008 defines
guarded state machines for seat holds and reservations and does not cover showtimes;
ADR-010 says only that cancelling is how a showtime is soft-deleted. `PATCH /showtimes/:id`
accepts a `status`, so the gap had to be filled before that route could exist.

## Decision

| From        | May become                         |
| ----------- | ---------------------------------- |
| `scheduled` | `active`, `completed`, `cancelled` |
| `active`    | `completed`, `cancelled`           |
| `completed` | — (terminal)                       |
| `cancelled` | `scheduled`                        |

A transition to the status a showtime already holds is a no-op and always succeeds.
Anything else is `409 SHOWTIME_INVALID_STATUS_TRANSITION`.

Separately, a **mutability** rule: `showDate`, `showTime` and `basePrice` may be changed
only while the showtime is `scheduled`. Otherwise `409 SHOWTIME_NOT_MODIFIABLE`.

`updateShowtime` evaluates the transition against the showtime's **current** status, then
mutability against its **resulting** status. `DELETE /showtimes/:id` runs the same
transition guard toward `cancelled`, and is a no-op if it is already cancelled.

## Why

- **`cancelled → scheduled` rather than a terminal `cancelled`.** ADR-010 states that "an
  accidental removal is undone by clearing the flag". For movies and halls that is
  literally `is_active = true`; for showtimes the equivalent flag _is_ the status, so
  making `cancelled` terminal would quietly withdraw ADR-010's promise for one entity
  type. An admin who cancels the wrong showtime must be able to put it back.
- **Reviving re-checks the slot.** A cancelled showtime is invisible to the overlap scan,
  so its slot may have been filled while it was gone. `cancelled → scheduled` therefore
  re-runs the BR-28 guard, and can fail with `SHOWTIME_OVERLAP` — un-cancelling is a
  request, not a guarantee.
- **`completed` is terminal.** A showtime that has finished is a historical fact that
  tickets and reservations already reference. Reopening it would let an admin retroactively
  change what customers were sold.
- **Transition judged before mutability, against the resulting status.** This makes a single
  `PATCH {status: 'scheduled', showDate, showTime}` on a cancelled showtime legal — un-cancel
  and reschedule in one call, which is the natural recovery from "cancelled the wrong one,
  and it needs a new slot anyway". Judging mutability against the _current_ status would
  force two requests, with the showtime briefly live in its old slot between them.
- **Rescheduling frozen after `scheduled`.** Once a showtime is `active`, customers may hold
  or own seats for it; moving its date, time or price would change the thing they bought
  underneath them.

## Rejected

- **`cancelled` as terminal**, with re-creation as the recovery path — rejected: it
  contradicts ADR-010's undo promise, and a re-created showtime is a new row, so any hold or
  reservation that pointed at the old one is orphaned.
- **Allowing `completed → active`** to fix a mistakenly completed showtime — rejected: the
  same PATCH is available while it is still `active`, and reopening a finished showtime
  invalidates ticket history.
- **Letting `basePrice` change in any status** — rejected: the price is what the ticket rows
  were written against; repricing a running showtime makes revenue reporting (DDR-010)
  ambiguous about which price applied.
- **Deriving status purely from the clock** (`show_date`/`show_time` versus `NOW()`), with no
  stored transitions — rejected: `cancelled` cannot be derived from a clock, and ADR-011's
  reporting reads status directly.

## Consequences

| Gains                                                                                                    | Costs accepted                                                                                                            |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Cancelling is genuinely reversible, so ADR-010's undo promise holds for showtimes as it does for movies. | Un-cancelling can fail with `SHOWTIME_OVERLAP` if the slot was refilled — recovery is not guaranteed, only offered.       |
| A finished showtime's ticket history cannot be rewritten.                                                | An admin who completes a showtime by mistake has no route back; it has to be re-created.                                  |
| One PATCH can un-cancel and reschedule, so a showtime is never briefly live in a slot nobody wanted.     | The two guards run in a specific order that is not obvious from reading either one alone, and is load-bearing.            |
| Every transition is explicit, so ADR-009's completion job can later drive the same guard unchanged.      | Until that job exists, `scheduled → active → completed` is entirely admin-driven; nothing advances a showtime on its own. |

## Follow-up

- ADR-009's 15-minute job should drive `scheduled → active → completed` once
  `@nestjs/schedule` is added. It must go through the same guard rather than writing
  `status` directly.
- BR-29 (a reservation may be cancelled only while its showtime is still in the future)
  is enforced in Reservations, and reads `show_date`/`show_time` rather than this status.
  The two must not drift apart when the completion job lands.

## Revisit if

Showtimes gain a state this table has no room for — a `postponed` that is neither cancelled
nor scheduled, say — at which point this record should be superseded rather than extended in
place.

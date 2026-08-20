---
name: decision-record
description: Create, supersede, or look up an ADR or DDR in docs/adr and docs/ddr. Use when the user says "record this decision", "write an ADR", "add a DDR", "why did we choose X", "supersede ADR-nnn", or when a change reverses something a decision record already settled.
---

# Decision records

This repo keeps two append-only logs under `docs/`:

- `docs/adr/` — decisions that shape the whole system and would be expensive to change.
- `docs/ddr/` — decisions made while implementing an ADR: a value, a step order, a shape.

The test is **how hard it would be to reverse**. ADR-007 chose to lock seats with a hold and a
database constraint; DDR-001 decides the hold lasts ten minutes. If you could change it this
afternoon without touching the architecture, it is a DDR.

**No decision appears in both logs.** If you are about to write the same thing twice, one of
the two records is wrong.

## Looking a decision up

Read `docs/adr/README.md` and `docs/ddr/README.md` — both carry the full index. Then read the
record itself; the index is a pointer, not a summary. Cite records by number in code comments,
commit messages and MR descriptions.

Before claiming the code follows a record, check `docs/decisions-vs-code.md` — three records
are currently known to disagree with what is committed.

## Writing a new record

1. **Decide which log.** Ask whether reversing it later would mean a migration and a rewrite
   (ADR) or an edit to one constant (DDR).
2. **Take the next number.** `ls docs/adr/` — use the next unused integer, zero-padded to
   four digits. Never reuse or renumber.
3. **Copy the template.** `docs/adr/_template.md` or `docs/ddr/_template.md`. Filename is
   `NNNN-kebab-case-title.md`, and the title in the file must match the index row.
4. **Fill it in.** Sections are not optional:
   - **Context** — the constraint or risk that forced a decision. Not the solution.
   - **Decision** — present tense, as a rule the codebase follows.
   - **Consequences / Why** — what it buys _and_ what it costs. A record with only gains is
     not a record.
   - **Rejected** — the alternatives, each with the reason it lost. This is the part a
     reviewer actually reads.
   - DDRs additionally need **Follow-up** and **Revisit if**.
5. **Add the index row** in the log's `README.md`, including which ADR a DDR implements.
6. **Update `docs/decisions-vs-code.md`** if the record describes something now implemented,
   now diverging, or not yet built.

## Superseding

Never edit a record to reverse it, and never delete one — other documents, commit messages
and review comments cite them by number.

1. Change the old record's status line to `Superseded by ADR-NNN` and leave everything else
   as it was.
2. Write the new record at the next number. Its Context must say what changed since the
   original — new requirement, measured problem, the old assumption proved wrong.
3. Update both index rows and `docs/decisions-vs-code.md`.

## Writing well

- Record the decision that was _actually taken_, including one you now think was wrong. These
  are a history, not a wish list.
- Be specific. "Ten minutes" beats "a short TTL". Name the constant, the index, the file.
- State costs plainly. The value of these records is that they show the trade was seen.
- Keep it to one screen where you can. Length is not rigour.
- Do not restate the requirement in the Decision section — link the mission objective instead
  (`docs/database/mission-objectives.md`).

## House facts worth checking against

Common ways a new record ends up contradicting an existing one:

- Auth is self-issued JWT with hashed, revocable refresh tokens (ADR-005). A third-party
  identity provider was considered and rejected.
- The HTTP layer is Express, deliberately, not Fastify (ADR-004).
- Nothing computed is stored — not seat availability (DDR-003), not revenue (DDR-010). Do not
  propose a counter or a summary table without superseding those.
- There is no payment step anywhere in the design; revenue means booked value (DDR-010).
- There is no message broker, no Redis, no job queue. Scheduled work runs in-process
  (ADR-009).

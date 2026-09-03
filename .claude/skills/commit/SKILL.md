---
name: commit
description: Write a Conventional Commit message from the staged changes and commit, validated against this repo's commitlint rules. Use when the user says "commit", "commit this", "write a commit message", "gen commit", or asks for a commit message for what is staged. Also handles batched commits — staging a large working tree in groups, one `[#N]` message per group, with a review gate before each commit.
---

# Commit

Turn the staged diff into a commit message this repo's `commit-msg` hook will accept. Validate
before committing — never let the hook be the thing that discovers a bad message.

## Header format — `[#N] type: subject`, no scope

Every header is a GitLab issue number in brackets, then a Conventional Commits type, then the
subject. **No scope** — `commitlint.config.js` has a custom `headerPattern`
(`/^\[#(\d+)\]\s+(\w+)(!)?:\s+(.+)$/`); anything else parses as empty type/subject and is
rejected.

```
[#218] feat: authenticate the mobile app against the movea api
[#181] feat: add showtimes and users entities
[#42]  fix: reject expired refresh tokens
```

The `[#N]` prefix is mandatory. Ask the user for the issue number if it is not already known
from the conversation — do not invent one, and do not commit without it.

## Two modes

- **Single commit** (default) — the user staged what they want; write one message, validate,
  commit. Steps 1–8 below.
- **Batched** — the user asks to split a large working tree into several commits ("commit in
  batches", "one commit per area", "stage each batch and let me review"). Use the batched
  workflow below, which drives steps 1–8 once per batch.

---

## Batched workflow

Use when the working tree holds one broad piece of work that reads better as a few commits, or
when the user asks for it explicitly.

1. **Get the issue number.** Every batch's header needs the same `[#N]`. Confirm it up front.
2. **Propose the batches before staging anything.** List each batch as
   `#, proposed [#N] type: subject, the files it covers`. Group by reason-to-exist, not by
   file type: a feature and the tests that cover it belong in the same batch; an unrelated
   generated-file drift belongs in none. Call out any file you are deliberately leaving
   unstaged and why. Let the user adjust the plan.
3. **For each batch, in order:**
   a. `git add <paths>` — exactly the files for this batch. Use explicit paths, or
   `git add <dir>` then `git restore --staged <exceptions>`. Never `git add -A`.
   b. `git diff --staged --stat` to confirm the set, and read `git diff --staged` (or
   `git diff --staged -- <path>` per area) so the message describes the real change.
   c. Write the `[#N] type: subject` message and body; **validate it** (step 7).
   d. **Stop at the review gate.** Show the user the staged file list and the exact commit
   message (including the trailer). Do not run `git commit` yet.
   e. The user reviews and then either commits the batch themselves, or tells you to commit
   it. Only run `git commit` on an explicit go for that batch.
   f. After the batch lands, move to the next one. Re-check `git status` first — a
   `pre-commit` hook (lint-staged) may have rewritten and re-staged files, and the working
   tree shifts as batches land.

If the user says "just stage and give me the message, I'll commit" — that is modes (a)–(d)
only. Never commit in that case.

---

## 1. Read what is staged

```bash
git status --short && git diff --staged --stat
```

Then read the actual change, not just the file list:

```bash
git diff --staged
```

If the diff is large, use `git diff --staged -- <path>` per area. You cannot pick a type or a
subject from filenames alone.

**Nothing staged?** Stop and say so. Show `git status --short` and ask what to stage. Do not
run `git add -A` on your own initiative — the user chose what to stage.

**Only some of the work staged?** That is normal and deliberate. Describe the staged change,
not the working tree.

## 2. Decide whether it is one commit

Staged changes covering two unrelated concerns should be two commits. If you see that, say so
and propose the split with the exact `git reset` / `git add` commands — then let the user
choose. Do not split without asking; they may have staged it together on purpose.

One commit is right when the changes share a single reason to exist. A new module plus the
`app.module.ts` line that registers it is one commit. A new module plus an unrelated typo fix
in the README is two.

## 3. Pick the type

Exactly one of these — `type-enum` is severity 2, so anything else is rejected:

| Type       | Use for                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| `feat`     | A capability that did not exist before (include the tests that cover it)     |
| `fix`      | A defect corrected in behaviour that already shipped                         |
| `docs`     | Documentation only — including `docs/`, `README.md`, `CLAUDE.md`, ADRs, DDRs |
| `style`    | Formatting, whitespace, Prettier — no behaviour change                       |
| `refactor` | Restructured code, same behaviour, no new capability and no defect fixed     |
| `perf`     | A change made for speed or resource use                                      |
| `test`     | Tests added or corrected, with **no** production-code change                 |
| `build`    | Build system, `package.json`, dependencies, Dockerfile, `docker-compose`     |
| `ci`       | Pipeline configuration                                                       |
| `chore`    | Housekeeping that fits nothing above — use it last, not first                |
| `revert`   | Reverting a previous commit                                                  |

`chore` is the fallback, not the default. Most changes have a truer type; the existing history
over-uses `chore` and is not the standard to copy.

## 4. No scope

This repo's header has no scope slot. Do not write `type(scope):` — the custom `headerPattern`
will not match it and the commit is rejected. Put the area in the subject instead
(`[#218] feat: expire seat holds after ten minutes`).

## 5. Write the subject

- Imperative mood, describing what the commit does: "hold seats for ten minutes", not "held"
  or "holds".
- Lower-case first word. `subject-case` forbids upper-case, PascalCase and Start Case at
  severity 2.
- No full stop at the end — `subject-full-stop`, severity 2.
- The whole header — `[#N] type: subject` — must be **120 characters or fewer**
  (`header-max-length`, severity 2). Aim for about 70 so it reads well in `git log --oneline`.
- Say what changed and why it matters, not which files moved. "reject expired refresh tokens"
  beats "update auth service".

## 6. Write the body, when it earns its place

Skip the body for a change that is obvious from its subject. Add one when there is a _why_ the
diff does not show: a constraint, a trade-off, a rejected alternative, a follow-up left undone.

- Blank line between subject and body (`body-leading-blank`).
- Wrap at 100 columns (`body-max-line-length` — severity 1, a warning, but wrap anyway).
- Reference the decision record when the change implements or contradicts one. This repo keeps
  `docs/adr/` and `docs/ddr/`, and records are cited by number:

  ```
  [#42] feat: expire seat holds after ten minutes

  Implements DDR-001. The sweep runs every sixty seconds; the confirmation transaction
  re-checks expiry itself (DDR-002), so a late sweep can never produce a wrong booking.
  ```

- Breaking change: `!` after the type **and** a `BREAKING CHANGE:` footer.

  ```
  [#88] feat!: return errorCode on every error response

  BREAKING CHANGE: the error envelope drops `error` and `path`. Clients matching on those
  fields must switch to `errorCode` (DDR-006).
  ```

- Closing an issue goes in a footer: `Closes #42`.

Append the attribution trailer this environment specifies (a `Co-Authored-By:` line, plus any
`Claude-Session:` line it gives you), after a blank line. Use whatever the current session's
instructions state — do not hard-code a model name.

## 7. Validate before committing

Pipe the exact message through commitlint. Check the exit code directly — do **not** pipe the
output into `tail` or `head` first, or you will read that command's status instead:

```bash
printf '[#218] docs: add adr and ddr decision logs\n' | npx commitlint
```

Exit `0` means it passes. Exit `1` prints each violated rule by name — fix the message and
re-run. Warnings (severity 1) do not fail the hook, but fix them anyway.

For a multi-line message, write it to a file first and validate that:

```bash
npx commitlint --edit .git/COMMIT_EDITMSG
```

## 8. Commit

Only when it is a single-commit request, or the user has given the go for this batch.
Multi-line messages go through a heredoc — never `-m` with embedded `\n`:

```bash
git commit -F - <<'MSG'
[#42] feat: expire seat holds after ten minutes

Implements DDR-001.

Co-Authored-By: <as the session specifies>
MSG
```

Then confirm what landed:

```bash
git log -1 --stat
```

## Hooks that will run

| Hook         | Runs                                        | If it fails                                  |
| ------------ | ------------------------------------------- | -------------------------------------------- |
| `pre-commit` | `lint-staged` — ESLint + Prettier on staged | Fix the code. Re-stage the files it rewrote. |
| `commit-msg` | `commitlint`                                | Should never fire if step 7 passed.          |

`lint-staged` rewrites files in place and re-stages them into the commit. Between batches,
re-run `git status` — a rewrite can leave a follow-up change unstaged, or shift what the next
batch should pick up.

`pre-push` separately runs `tsc --noEmit`, `lint:check` and the unit tests, so a commit that
compiles is not yet a commit that pushes.

Never use `--no-verify` to get past a failing hook. Fix the cause. If the user explicitly asks
to skip, that is their call.

## Rules that will reject a message

Severity 2 blocks the commit; severity 1 warns. Source of truth is `commitlint.config.js` —
read it if a rule here looks wrong.

| Rule                     | Requirement                                      | Severity |
| ------------------------ | ------------------------------------------------ | -------- |
| `headerPattern` (parser) | `[#N] type: subject` — bracketed issue, no scope | error    |
| `type-enum`              | One of the eleven types above                    | error    |
| `type-empty`             | Present (fails if `[#N]` prefix is missing)      | error    |
| `subject-empty`          | Present (fails if `[#N]` prefix is missing)      | error    |
| `subject-full-stop`      | Must not end with `.`                            | error    |
| `subject-case`           | Not UPPER-CASE, PascalCase or Start Case         | error    |
| `header-max-length`      | 120 characters including the `[#N]` prefix       | error    |
| `body-leading-blank`     | Blank line before the body                       | warning  |
| `body-max-line-length`   | 100 columns                                      | warning  |
| `footer-leading-blank`   | Blank line before footers                        | warning  |

## Do not

- Commit when the user only asked for a message, or asked to stage-and-review. Show it and
  stop.
- Commit any batch before the user has reviewed that batch's staged files and message.
- Stage files the user did not ask for. In batched mode, stage only the current batch.
- Run `git add -A`.
- Describe the working tree instead of the staged diff.
- Invent an issue number, or omit the `[#N]` prefix.
- Pad a subject to look thorough. `[#42] fix: reject expired refresh tokens` is finished.

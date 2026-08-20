---
name: commit
description: Write a Conventional Commit message from the staged changes and commit, validated against this repo's commitlint rules. Use when the user says "commit", "commit this", "write a commit message", "gen commit", or asks for a commit message for what is staged.
---

# Commit

Turn the staged diff into a commit message this repo's `commit-msg` hook will accept, then
commit. Validate before committing — never let the hook be the thing that discovers a bad
message.

## 1. Read what is staged

```bash
git status --short && git diff --staged --stat
```

Then read the actual change, not just the file list:

```bash
git diff --staged
```

If the diff is large, use `git diff --staged -- <path>` per area. You cannot pick a type, a
scope or a subject from filenames alone.

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
| `feat`     | A capability the API did not have before                                     |
| `fix`      | A defect corrected in behaviour that already shipped                         |
| `docs`     | Documentation only — including `docs/`, `README.md`, `CLAUDE.md`, ADRs, DDRs |
| `style`    | Formatting, whitespace, Prettier — no behaviour change                       |
| `refactor` | Restructured code, same behaviour, no new capability and no defect fixed     |
| `perf`     | A change made for speed or resource use                                      |
| `test`     | Tests added or corrected, with no production-code change                     |
| `build`    | Build system, `package.json`, dependencies, Dockerfile, `docker-compose`     |
| `ci`       | Pipeline configuration                                                       |
| `chore`    | Housekeeping that fits nothing above — use it last, not first                |
| `revert`   | Reverting a previous commit                                                  |

`chore` is the fallback, not the default. Most changes have a truer type; the existing history
over-uses `chore` and is not the standard to copy.

## 4. Pick the scope

Optional, lower-case, free-form. Use the module or area actually touched:

`auth`, `users`, `movies`, `showtimes`, `reservations`, `tickets`, `reports`, `health`,
`common`, `config`, `db`, `docs`, `ci`, `deps`

Omit the scope when the change genuinely spans the repo (a global lint pass, a root config).
Do not invent a scope to fill the slot, and do not list two — pick the dominant one.

## 5. Write the subject

- Imperative mood, describing what the commit does: "hold seats for ten minutes", not "held"
  or "holds".
- Lower-case first word. `subject-case` forbids upper-case, PascalCase and Start Case at
  severity 2.
- No full stop at the end — `subject-full-stop`, severity 2.
- The whole header — `type(scope): subject` — must be **100 characters or fewer**
  (`header-max-length`, severity 2). Aim for about 65 so it reads well in `git log --oneline`.
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
  feat(reservations): expire seat holds after ten minutes

  Implements DDR-001. The sweep runs every sixty seconds; the confirmation transaction
  re-checks expiry itself (DDR-002), so a late sweep can never produce a wrong booking.
  ```

- Breaking change: `!` after the type or scope **and** a `BREAKING CHANGE:` footer.

  ```
  feat(api)!: return errorCode on every error response

  BREAKING CHANGE: the error envelope drops `error` and `path`. Clients matching on those
  fields must switch to `errorCode` (DDR-006).
  ```

- Closing an issue goes in a footer: `Closes #42`.

Append the trailer this environment uses, after a blank line:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

## 7. Validate before committing

Pipe the exact message through commitlint. Check the exit code directly — do **not** pipe the
output into `tail` or `head` first, or you will read that command's status instead:

```bash
printf 'docs: add adr and ddr decision logs\n' | npx commitlint
```

Exit `0` means it passes. Exit `1` prints each violated rule by name — fix the message and
re-run. Warnings (severity 1) do not fail the hook, but fix them anyway.

For a multi-line message, write it to a file first and validate that:

```bash
npx commitlint --edit .git/COMMIT_EDITMSG
```

## 8. Commit

Multi-line messages go through a heredoc — never `-m` with embedded `\n`:

```bash
git commit -F - <<'MSG'
feat(reservations): expire seat holds after ten minutes

Implements DDR-001.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
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

`lint-staged` rewrites files in place. If it does, those rewrites are **not** in the commit you
just made unless it re-staged them — check `git status` afterwards.

`pre-push` separately runs `tsc --noEmit`, `lint:check` and the unit tests, so a commit that
compiles is not yet a commit that pushes.

Never use `--no-verify` to get past a failing hook. Fix the cause. If the user explicitly asks
to skip, that is their call.

## Rules that will reject a message

Severity 2 blocks the commit; severity 1 warns.

| Rule                   | Requirement                              | Severity |
| ---------------------- | ---------------------------------------- | -------- |
| `type-enum`            | One of the eleven types above            | error    |
| `type-case`            | Lower-case                               | error    |
| `type-empty`           | Present                                  | error    |
| `subject-empty`        | Present                                  | error    |
| `subject-full-stop`    | Must not end with `.`                    | error    |
| `subject-case`         | Not UPPER-CASE, PascalCase or Start Case | error    |
| `scope-case`           | Lower-case                               | error    |
| `header-max-length`    | 100 characters including type and scope  | error    |
| `body-leading-blank`   | Blank line before the body               | warning  |
| `body-max-line-length` | 100 columns                              | warning  |
| `footer-leading-blank` | Blank line before footers                | warning  |

Source of truth is `commitlint.config.js`. Read it if a rule here looks wrong — the config
wins, not this list.

## Do not

- Commit when the user only asked for a message. Show it and stop.
- Stage files the user did not stage.
- Describe the working tree instead of the staged diff.
- Pad a subject to look thorough. `fix(auth): reject expired refresh tokens` is finished.

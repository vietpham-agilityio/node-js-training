---
description: Commit exactly what's already staged, with a message inferred from the diff
---

Commit only what the user has already staged with `git add` — do not stage anything yourself, do not use `git add -A`/`git add .`, and do not touch unstaged or untracked files.

1. Run in parallel:
   - `git status` (never `-uall`)
   - `git diff --staged`
   - `git log --oneline -10` (to match this repo's existing style: `type: short imperative summary`, e.g. `feat:`, `chore:`, `fix:`)
2. If `git diff --staged` is empty, stop and tell the user nothing is staged — do not create an empty commit, do not stage anything on their behalf.
3. Skim the staged diff for anything that looks like a secret (`.env`, credentials, private keys, tokens) even in an innocuously-named file. If found, warn the user and ask before committing rather than committing silently.
4. Draft a single-line commit message from the staged diff: `type: short imperative summary`, matching this repo's existing log style (e.g. `chore: add dev/production Docker build targets`). No body, no bullet points — one line only.
5. Commit it:
   ```
   git commit -m "type: short imperative summary"
   ```
6. Run `git status` after to confirm, and report the resulting commit hash/summary back to the user.

Do not push. Do not amend. If the commit fails on a pre-commit hook, fix the underlying issue, re-stage only the files affected by the fix, and create a new commit — never `--no-verify`.

## The bug

<!-- What went wrong, observed rather than inferred. Paste the error or the wrong output. -->

Closes #

## Root cause

<!-- Why it happened. If a decision record was ambiguous or wrong, say which. -->

## The fix

<!-- What changed, and why this fix rather than another. -->

## Regression test

<!-- The test that fails before this change and passes after. Name it. -->

-

## Checklist

- [ ] A test reproduces the bug and now passes
- [ ] `pnpm run lint:check` and `pnpm test` pass locally
- [ ] Scope is the fix only — no unrelated refactors
- [ ] If a decision record was wrong or unclear, it is updated or superseded in this MR
- [ ] `docs/decisions-vs-code.md` updated if this resolves a listed divergence

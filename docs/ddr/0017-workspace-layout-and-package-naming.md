# DDR-017 — Workspace Layout and Package Naming

Accepted · 03 Sep 2026 · Related: ADR-015, ADR-016

## Context

ADR-015 chose a pnpm workspace. That decision does not say where packages live, what they
are called, or which configuration is shared — and those answers have to be the same
everywhere for filters, path globs and CI triggers to work.

## Decision

**Layout.** Two globs, `apps/*` and `packages/*`. `apps/*` holds deployables — `apps/api`,
`apps/mobile`. `packages/*` holds everything imported rather than deployed. Nothing else
sits at the top level of the workspace.

**Naming.** Every package is `@movea/<dir>`: `@movea/api`, `@movea/mobile`,
`@movea/api-contract`. The scope makes `pnpm --filter @movea/api` unambiguous and the suffix
always matches the directory, so a path and a filter are mechanically derivable from each
other.

**Script names are a contract.** Turborepo tasks work only if every package spells them the
same: `build`, `dev`, `typecheck`, `lint:check`, `test`. A package that cannot meaningfully
implement one still declares it as a no-op rather than omitting it, so `turbo run` never
half-fans-out.

**What lives at the root.** The lockfile, `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`,
Husky hooks, `commitlint.config.js`, `lint-staged` config, `docker-compose*.yml`, and
`docs/`. `docs/` stays at the root because ADRs and DDRs describe the system, not one app.

**What stays per-app.** Anything whose tooling genuinely differs: `tsconfig.json`,
`eslint.config.*`, `.prettierrc`, Jest config, and the API's `Dockerfile`. No
`packages/tsconfig` or `packages/eslint-config` is created — `nodenext` with decorators and
`esnext` with `react-native` JSX share almost nothing, and a shared base would be an empty
file pretending to be a convention.

**`lint-staged` dispatches by path**, running each app's own ESLint binary, so a staged
mobile file is never linted with the API's flat config.

**The API's `.dockerignore` is `apps/api/Dockerfile.dockerignore`.** The build context is
the workspace root (it needs the root lockfile), but BuildKit reads
`<dockerfile>.dockerignore` in preference to the context-root file, which keeps it beside
the Dockerfile it belongs to. Its paths are relative to the workspace root.

## Consequences

- `pnpm --filter @movea/<name>` and `apps/<name>` are always derivable from each other, so
  CI path filters and Turborepo filters cannot fall out of step.
- Adding a deployable means one directory under `apps/`; no root file changes.
- Adding a shared library means one directory under `packages/` and adding it to the CI path
  filters of every app that consumes it — the one manual step this layout does not automate.
- The two apps' lint and TypeScript settings can diverge freely, which is what lets an Expo
  app and a NestJS service coexist without either compromising.
- Renaming a package means touching its `package.json`, both CI filters and any `--filter`
  in a script. The naming rule keeps that list short but does not eliminate it.

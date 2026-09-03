# ADR-015 — pnpm Workspace Monorepo for the API and the Mobile Client

Accepted · 03 Sep 2026 · Related: ADR-012, ADR-014, ADR-016, DDR-017

## Context

The ticket-management API is complete. The Expo client that will consume it lived in a
separate repository and still talks to Supabase. Migrating it onto this API means the two
codebases have to agree on request and response shapes across every endpoint.

With two repositories that agreement can only be maintained by hand: a DTO changes here, and
nothing tells the client until it fails at runtime. The status vocabularies are the sharp
edge — ADR-008 ties seat-hold state to a partial unique index, so a client holding a stale
copy of that enum is a correctness problem, not a typo.

Two repositories also meant two lockfiles, two Husky installations, two commitlint configs
that disagreed on whether a scope was allowed, and two `setup-node` composite actions.

## Decision

One repository, a pnpm workspace, with `apps/api` and `apps/mobile` as sibling packages and
shared code under `packages/*`. Turborepo runs `build`, `typecheck`, `lint:check` and `test`
across the graph.

The contract between the two is not hand-written. `packages/api-contract` is generated from
the API's own OpenAPI document (ADR-012) by `pnpm contract:generate`; the mobile app depends
on it as `workspace:*`. There is exactly one definition of every published shape, and it is
the one the running API serves.

## Consequences

- A DTO change and the client change that follows it land in one commit and one review.
- The contract cannot silently drift: regenerating it is a diff, and a stale client fails at
  `typecheck` rather than in a user's hands.
- Root-level tooling is defined once — one lockfile, one hook set, one commit convention.
- `node-linker=hoisted` is now workspace-wide, because Metro requires it. The API loses
  pnpm's strict dependency isolation and can now import a package it does not declare.
- A single lockfile means both apps re-resolve together. The first install after the merge
  drifted forty of the mobile app's direct dependencies upward inside their declared ranges
  and broke its type-check; the mobile app's versions are pinned exactly as a result. Any
  future dependency bump there is deliberate rather than incidental.
- Both apps are versioned and tagged together, so the mobile app cannot be released from a
  commit whose API half was never reviewed.
- The repository is larger, and a full `pnpm install` now pays for both dependency trees
  even when working on one app.

## Rejected

- **Two repositories with a published contract package** — keeps the trees isolated, but
  needs a registry, a release step and a version bump between every API change and the
  client change that consumes it. That latency is the problem the move is meant to remove.
- **Two repositories with a copied type file** — free to set up, and drifts the first time
  someone forgets. This is precisely the failure ADR-008's invariant cannot tolerate.
- **Nx instead of Turborepo** — a richer affected-graph and generators, but a large amount
  of configuration to own for two applications and one shared package.
- **npm or Yarn workspaces** — both are viable; pnpm was already the package manager for
  both projects, so switching would have been a second migration inside this one.

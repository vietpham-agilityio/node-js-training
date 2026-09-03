# ADR-016 — Independent Per-App CI Pipelines in One Repository

Accepted · 03 Sep 2026 · Related: ADR-014, ADR-015

## Context

Merging the API and the mobile client into one repository (ADR-015) put two very different
pipelines under one `.github/workflows`. The API's pipeline lints, tests, builds and pushes
a Docker image; the mobile pipeline lints, tests, validates the Expo config and triggers EAS
cloud builds on macOS runners.

The obvious move — one workflow that does everything — is the wrong one. An EAS build takes
tens of minutes on a paid macOS runner. Chaining it behind the API's Docker push means a
one-line change to a NestJS service waits on a mobile build it cannot affect, and a red
mobile job blocks an API deployment that is fine.

## Decision

Each app keeps its own workflow, triggered by its own path filter, and the two run in
parallel:

- `api-ci.yml` — fires on `apps/api/**`, `packages/**` and the workspace manifests.
- `mobile-ci.yml` and `mobile-build-*.yml` — fire on `apps/mobile/**`, `packages/**` and the
  workspace manifests.

They share exactly two things: the `setup-node-and-pnpm` composite action, and the root
lockfile that action installs from. Nothing else crosses between them — no `needs:` edge, no
shared job, no aggregate gate.

`packages/**` is in both filters on purpose. A change to the generated contract is a change
to the agreement between the two apps, and both sides must re-verify against it.

Each workflow sets its own `concurrency` group, so a new push cancels only its own app's
in-flight run.

## Consequences

- An API-only change never queues a macOS runner, and a mobile-only change never builds a
  Docker image. Most pushes now run half the CI they used to.
- When a change does touch both, the two pipelines run side by side, so wall-clock time is
  the slower of the two rather than their sum.
- A failing mobile build cannot block an API deploy, and the reverse.
- Required-checks configuration is per-app, so branch protection has to name both sets.
  There is no single "CI passed" job spanning the repository.
- Path filters are a maintenance surface: a new shared directory that is missing from a
  filter produces a silent green, not a failure. Anything added beside `packages/` must be
  added to both filters.
- Duplicated structure between the two workflow files is accepted; the shared setup action
  is the only thing factored out, because further sharing would recouple them.

## Rejected

- **One workflow with conditional jobs** — a single required check and no duplication, but
  every job shares the workflow's concurrency and trigger, so the coupling this decision
  exists to avoid comes straight back.
- **Turborepo `--filter=...[origin/main]` as the change detector** — more precise than path
  filters and aware of the dependency graph, but it decides what to skip _after_ the runner
  has started and the workspace has installed. Path filters avoid starting the job at all.
- **Splitting CI back out to per-app repositories** — full isolation, at the cost of the
  single-commit contract change that ADR-015 was adopted to get.

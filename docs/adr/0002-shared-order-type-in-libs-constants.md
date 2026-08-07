# 0002. Shared Order type lives in libs/constants, not re-exported from apps/order

Status: Accepted
Date: 2026-07-28

## Context

`libs/constants/src/shared/entities/order.entities.ts` was `export * from "apps/order/src/order.entity"` — a lib depending on an app, backwards from the intended direction. It existed because `apps/inventory/src/inventory.service.ts` needs the `Order` shape to type its TCP event handler (`handleOrderCreated(order: Order)`), and importing it via `libs/constants` was presumably meant to avoid a direct `apps/order` import — but the re-export just moved the cross-app dependency one level, since the lib's file still pointed straight at `apps/order/src/order.entity.ts`. A grep for the literal string `apps/order/src/order.entity` initially missed this because the real consumer imported through the `@app/constants/shared/entities/order.entities` alias, not the literal path — worth remembering when checking "is anything still using this" for a deletion.

## Decision

Define the canonical `Order` shape as a plain interface (plus the `OrderStatus` enum) directly in `libs/constants/src/shared/order.interface.ts` — no dependency on any app. `apps/order/src/order.entity.ts` keeps its `Order` class (used throughout `apps/order` as before) but now `implements` the shared interface and re-exports `OrderStatus` from `@app/constants`, so existing imports (`order.controller.ts`, `order.dto.ts`, `order.service.ts`) didn't need to change. `apps/inventory/src/inventory.service.ts` now imports `Order` straight from `@app/constants`.

## Consequences

Both `order` and `inventory` depend on the lib, not on each other — the tangle is gone. If the `Order` shape needs a new field, it's added to the interface in `libs/constants` first; `apps/order/src/order.entity.ts`'s class will fail to compile if it drifts out of sync (the `implements` clause enforces it), which is the intended safety net. No runtime behavior changed.

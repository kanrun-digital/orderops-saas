# Order Lifecycle

This document is limited to the **currently observable order detail UI** that is rendered from the order page and the baseline components under `src/components/orders/`.

## Audit baseline

The current implementation baseline for this document is:

- `src/components/orders/OrderStatusCard.tsx`
- `src/components/orders/OrderRoutingCard.tsx`
- `src/components/orders/OrderSyncTimeline.tsx`
- `src/components/orders/OrderCustomerCard.tsx`
- `src/components/orders/OrderHeader.tsx`

These components are mounted from `src/app/(app)/orders/[id]/page.tsx` on the order detail screen.

## Current rendered state

All five audited components are placeholder shells right now.

| Component | What a user can currently observe |
|---|---|
| `OrderHeader` | A card area labeled `[OrderHeader]`. |
| `OrderRoutingCard` | A card area labeled `[OrderRoutingCard]`. |
| `OrderStatusCard` | A card area labeled `[OrderStatusCard]`. |
| `OrderCustomerCard` | A card area labeled `[OrderCustomerCard]`. |
| `OrderSyncTimeline` | A card area labeled `[OrderSyncTimeline]`. |

Each component accepts props, but in the current code they do not render those props into visible UI.

## Role-based capability audit

The documentation should only keep role-based statements that are visible in the current app build.

### Operator capabilities

| Capability | Audit result | Documentation decision |
|---|---|---|
| View order header details inside `OrderHeader` | Not implemented in the audited component. The component only renders the placeholder label. | Remove from the guide. |
| View routing information inside `OrderRoutingCard` | Not implemented in the audited component. The component only renders the placeholder label. | Remove from the guide. |
| View status controls or status history inside `OrderStatusCard` | Not implemented in the audited component. The component only renders the placeholder label. | Remove from the guide. |
| View customer details inside `OrderCustomerCard` | Not implemented in the audited component. The component only renders the placeholder label. | Remove from the guide. |
| View sync history inside `OrderSyncTimeline` | Not implemented in the audited component. The component only renders the placeholder label. | Remove from the guide. |

### Admin capabilities

| Capability | Audit result | Documentation decision |
|---|---|---|
| See admin-only header controls via `isAdmin` in `OrderHeader` | Planned / not yet implemented. The page passes `isAdmin`, but `OrderHeader` does not use it or render any admin-only UI. | Mark as planned / not yet implemented, or remove from user-facing guidance. |
| Admin-only controls in the other audited order cards | Not implemented. No role checks or admin-only rendering are present in the audited component files. | Remove from the guide. |

### Developer capabilities

| Capability | Audit result | Documentation decision |
|---|---|---|
| Developer-visible diagnostics in `OrderSyncTimeline` | Not implemented in the audited component. Only the placeholder label is rendered. | Remove from the guide. |
| Developer-facing routing or status debug details in the audited cards | Not implemented in the audited components. | Remove from the guide. |

## What should remain in the guide

The guide can safely describe only the following observable behavior for these sections:

- The order detail page mounts five order-related sections based on the audited components.
- Each audited section currently renders a placeholder label rather than real order lifecycle data.
- No role-specific differences are currently visible inside these audited components.

## What should not be documented as current behavior

Remove any statements that imply the current app already shows any of the following inside the audited components:

- operator-specific lifecycle actions
- admin-only lifecycle controls
- developer diagnostics or sync debugging tools
- rendered customer, routing, status, or sync data inside the five audited components

## Implementation notes

A few props suggest future intent, but they are not yet user-visible and should not be documented as active behavior:

- `OrderHeader` receives `order` and `isAdmin`.
- `OrderRoutingCard` receives `order`.
- `OrderStatusCard` receives `order` plus several action/status props.
- `OrderCustomerCard` receives `order`.
- `OrderSyncTimeline` receives `orderId`.

Until these props are actually rendered into visible UI, the guide should treat the related capabilities as planned rather than implemented.

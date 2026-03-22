# Hooks catalog for `src/hooks`

This document fixes the canonical inventory of every file in `src/hooks` so migration checks do not depend on hand-counting.

## Canonical status summary

- `src/hooks` currently contains **40 hook files**.
- **36 files** are `/api/data` hooks: they call the NCB data proxy via `/api/data/...`.
- **1 file** is a **non-data API** hook: it orchestrates auth/session flows without using `/api/data/...`.
- **3 files** are **UI/local-state hooks** and **must not** be counted as API hooks.

> If an older migration note or checklist mentions **"39 API hooks"**, do **not** use that number as the source of truth for this repository snapshot. The canonical contract is the categorized file list below.

## `/api/data` hooks (36)

- `salesbox.ts`
- `useAccountData.ts`
- `useAccountIntegrations.ts`
- `useAccountSettings.ts`
- `useAccountSubscription.ts`
- `useBackgroundSync.ts`
- `useBitrix.ts`
- `useBolt.ts`
- `useConnectionList.ts`
- `useCustomerBulkPush.ts`
- `useCustomerDataOps.ts`
- `useCustomerIngestionStats.ts`
- `useCustomerMatchLog.ts`
- `useCustomerSegments.ts`
- `useCustomerStats.ts`
- `useCustomers.ts`
- `useDashboardHealth.ts`
- `useIntegrationMenuStats.ts`
- `useMenu.ts`
- `useMenuExport.ts`
- `useMenuReset.ts`
- `useMenuSyncProviders.ts`
- `useOrderAssignments.ts`
- `useOrderPii.ts`
- `useOrders.ts`
- `useOrdersServerQuery.ts`
- `useProductMappingMatrix.ts`
- `useProfile.ts`
- `usePublicSites.ts`
- `useSalesboxChats.ts`
- `useSyncActions.ts`
- `useSyncLogs.ts`
- `useSyrve.ts`
- `useSystemAdmin.ts`
- `useTeamManagement.ts`
- `useUnifiedSyncLogs.ts`

## Migration notes for hooks with historically ambiguous scope

These notes are the migration-facing contract for hooks whose older descriptions overstated or blurred their data sources.

### `useBolt.ts`

- **Current implementation:** reads only `/api/data/bolt_connections` and `/api/data/bolt_stores`, then exposes `{ connections, stores }` plus connection status helpers.
- **Not included in the current hook contract:** Bolt webhook-event history and menu-export records.
- **Migration rule:** do **not** describe `useBolt.ts` as covering webhook events or menu exports unless the hook is explicitly extended to query and return those datasets.

### `useBitrix.ts`

- **Current implementation:** reads `/api/data/bitrix_connections` and exposes the connection list plus sync/disconnect actions backed by `/api/data/sync_jobs` and `/api/data/bitrix_connections/:pk_id`.
- **Not included in the current hook contract:** Bitrix products and Bitrix users datasets.
- **Migration rule:** do **not** describe `useBitrix.ts` as covering products or users unless the hook is explicitly extended to fetch and return those tables.

### `useDashboardHealth.ts`

- **Current implementation:** this is an **operational dashboard health hook** composed from live reads against `/api/data/provider_connections`, `/api/data/admin_alerts`, `/api/data/external_item_mappings`, and `/api/data/sync_jobs`.
- **Not the source of truth for analytics summary:** it does **not** read `/api/data/account_analytics_summary`.
- **Migration rule:** keep `useDashboardHealth.ts` documented as the live operational-health hook. If summary-table reporting is needed, document that as a separate analytics-summary hook/consumer instead of implying that `useDashboardHealth.ts` is backed by `account_analytics_summary`.

### `useProfile.ts`

- **Current implementation:** profile reads and updates are keyed by `session.id` via `/api/data/profiles?id=${session.id}`.
- **Migration rule:** any migration description must state that the hook now resolves profiles by `session.id`, not by a legacy user identifier variant.

## Non-data API hooks (1)

These hooks still orchestrate remote/network behavior, but they do not use the `/api/data/...` proxy.

- `use-auth.ts` — session/auth provisioning and sign-in/sign-out orchestration.

## UI/local-state hooks (3)

These hooks are local UI/context helpers and **must not** be included in any API-hook total.

- `use-toast.ts`
- `useLanguageSwitcher.ts`
- `useMenuScope.ts`

## `useMenuScope.ts` status

`useMenuScope.ts` is **officially classified as a UI-only hook**. It stores menu page scope/provider state with React local state and does not call `/api/data/...` or any other backend endpoint.

Because of that, `useMenuScope.ts` must be excluded from any migration accounting for API hooks. Keeping the file in `src/hooks/` is acceptable as long as the canonical inventory above remains the reference used by migration and audit notes.

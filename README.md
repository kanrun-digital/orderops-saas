# OrderOps

Centralized restaurant operations, menu, order, and integration management platform.

## Overview

**OrderOps** is a B2B web application for restaurant teams that centralizes daily operational workflows in a single interface. It is designed to reduce context switching between disconnected systems and give operators, managers, and support teams one place to manage orders, menus, integrations, customer data, delivery workflows, QR menu sites, analytics, and account operations.

The current codebase is built as a **Next.js** application and organized around back-office workflows for restaurant operations. It includes authenticated app areas, integration management flows, operational dashboards, billing screens, customer tooling, and restaurant-facing QR menu management.

## What the Product Does

OrderOps combines the operational areas that restaurant teams usually manage across multiple tools:

- **Operational dashboard** for orders, product counts, integration health, sync issues, alerts, and action queues
- **Order management** with filtering, status handling, assignment workflows, bulk actions, and provider-specific actions
- **Customer operations** including search, segmentation, source matching, review queues, CSV import, and sync visibility
- **Menu management** with category navigation, search, stop-list handling, account/location scope switching, and export/reset flows
- **Integrations management** for POS, catalog, and delivery providers with setup flows, sync schedules, and connection panels
- **Delivery zone workflows** for import, mapping, routing checks, and publishing
- **Sync monitoring** with provider/job summaries, history tables, retry/cancel controls, and routing metrics
- **QR menu management** for public menu sites, dining tables, QR previews, and publish/draft workflows
- **Billing** with subscription visibility, checkout/portal entry points, and admin controls
- **Analytics and reviews** for operational reporting, customer/revenue summaries, review reports, and settings
- **Support workflows** such as chats and operational follow-up views

## Key Features

- **Unified restaurant operations**
  - Manage menus, orders, delivery-related workflows, and customer processes in one back-office product.

- **Real-time operational visibility**
  - Give teams a single place to monitor fulfillment, sync health, issue queues, and follow-up actions.

- **Integration hub**
  - Connect and manage restaurant systems across POS, catalog, CRM, and delivery domains.

- **Order workflow management**
  - Review, filter, sort, assign, update, and process operational order flows from a centralized interface.

- **Menu control**
  - Browse and organize product catalogs, work with category trees, switch scopes, export to connected providers, and manage resets.

- **Customer data workflows**
  - Work with customer lists, matching/review queues, provider presence, and bulk actions.

- **QR menu operations**
  - Configure public menu sites, create dining tables, preview QR output, and manage publication status.

- **Billing and account operations**
  - Support subscription visibility and billing workflows through manual and Stripe-based paths.

## Supported Integration Domains

The current repository includes provider constants, routing, and UI flows for the following integration domains:

- **Syrve**
- **Poster**
- **Bitrix24**
- **Salesbox**
- **Checkbox**
- **Bolt Food**
- **Glovo**
- **Wolt**
- **Uber Eats**
- **Menu.ua**

Depending on implementation state, some providers are represented by full UI flows, while others are represented by platform constants, routing support, or integration scaffolding.

## Tech Stack

- **Next.js 15**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Radix UI**
- **TanStack React Query**
- **Zustand**
- **date-fns**
- **Lucide React**

## Architecture

The project follows a modular Next.js structure:

- `src/app` — application routes and page-level features
- `src/components` — reusable UI primitives and domain-specific components
- `src/hooks` — data-fetching, API orchestration, and UI helper hooks (canonical inventory: `docs/hooks-catalog.md`)
- `src/services` — shared API and auth service helpers
- `src/lib` — domain constants, integration helpers, utilities, and core logic
- `src/contexts` / `src/stores` — account/auth state and client-side state management

### Backend Integration Model

The current project integrates with **NCB (NoCodeBackend)** for data and authentication flows.

Key architectural points:

- server-side and user-context CRUD helpers are implemented in the NCB client layer
- auth/session handling is connected through NCB auth endpoints
- browser-facing routes are exposed through internal Next.js API routes
- the application uses React Query for client data orchestration

This codebase is structured as a **Next.js + NCB** application, with Next.js handling the frontend and internal API surface while NCB provides the backend data and authentication integration layer.

## Application Areas

### Authentication
- Login and signup routes
- Session-aware redirect flow
- Account-aware authenticated application shell

### Dashboard
- Welcome view
- Summary metrics for orders and menu
- Integration health indicators
- Alert/action queue surfaces
- Recent order activity

### Orders
- Search, filters, sorting, and pagination
- Status visibility and action handling
- Assignment workflows
- Provider-aware actions
- Order lifecycle reference: `docs/order-lifecycle.md`

### Current PII behavior in orders

The current repository does **not** implement a working order-PII fetch/decrypt flow.

- `src/hooks/useOrderPii.ts` is a placeholder. `useOrderPii()` always returns `phone`, `email`, and `address` as `null`, `isLoading` as `false`, `isRevealed` as `false`, and a no-op `reveal()` function. `useCanViewPii()` always returns `{ canView: false, isAdmin: false }`.
- Because `useCanViewPii()` is hard-coded to `false`, the orders list page masks customer phone numbers instead of revealing them.
- On the orders list page, CRM-assigned operator phone numbers also go through the masking policy helper, so they are shown masked when a masked value is available and otherwise fall back to a locally masked raw phone value.
- On the order details page, the only active PII-related display logic is the CRM operator phone helper. The page imports `useCanViewPii()`, but with the current placeholder hook it always resolves to the masked path.
- `OrderCustomerCard` on the order details page is currently a placeholder component that renders `[OrderCustomerCard]`; it does not fetch, decrypt, or display customer PII today.
- The invalidation of the React Query key `['order-pii', orderId]` on the order details page does not currently connect to an implemented query in this repository.
- The repository currently contains a user-facing error string for `PII decryption failed`, but there is no corresponding decryption implementation in `useOrderPii.ts` or an order-PII query hook.

### Current order PII access matrix

Actual account roles currently defined in `src/types/index.ts` are:

- `owner`
- `admin`
- `manager`
- `staff`
- `driver`

Current behavior in this repository is the same for every listed role because `useCanViewPii()` always returns `false`.

| Role | Can reveal customer phone/email/address via `useOrderPii()`? | What users currently experience in orders UI |
|---|---:|---|
| `owner` | No | Customer phone is masked in the orders list; no implemented reveal flow exists. |
| `admin` | No | Customer phone is masked in the orders list; CRM operator phone is masked on list/detail pages. |
| `manager` | No | Same current behavior as `owner` and `admin`. |
| `staff` | No | Same current behavior as other roles. |
| `driver` | No | Same current behavior as other roles. |

### Planned / not yet implemented PII items

The following names should be treated as planned or not yet implemented in the current codebase unless new code is added:

- `system_admin` as a distinct PII-access role for orders
- `order_customer_pii` claims/permissions
- an implemented `order-pii` data query or reveal API flow
- `PII_ENCRYPTION_KEY`
- audit-log claims or audit-log enforcement tied to order PII reveal events

### Customers
- Customer directory
- Matching/review support
- Source/provider visibility
- CSV import and bulk actions
- Customer sync support panels

### Menu
- Category tree navigation
- Product search and filtering
- Account-level vs location-level scope
- Export to supported providers
- Menu reset flow

### Integrations
- Grouped provider sections
- Connection setup flows
- Sync settings and sync schedule panels
- POS, catalog, and delivery connection management

### Delivery Zones
- Import workflow
- Mapping workflow
- Routing test workflow
- Publish workflow

### Sync Dashboard
- Provider/job summaries
- Unified sync history
- Retry/cancel actions
- Routing metrics

### QR Menu
- Public site management
- Table management
- Site publication flow
- QR preview and public link handling

### Billing
- Subscription overview
- Stripe checkout and billing portal entry points
- Manual admin billing controls

### Analytics, Reviews, Chats
- Analytics summary views
- Review reporting/settings screens
- Chat inbox and conversation workflows

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the required values.

```bash
cp .env.example .env.local
```

Required variables:

```env
NCB_INSTANCE=55446_orderops_systems
NCB_DATA_API_URL=https://openapi.nocodebackend.com
NCB_AUTH_API_URL=https://app.nocodebackend.com/api/user-auth
NCB_SECRET_KEY=<your_ncb_secret_key>

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional / production-related:

```env
UNIONE_API_KEY=<your_unione_api_key>
NOTIFICATION_SENDER_EMAIL=noreply@your-domain.com
NOTIFICATION_SENDER_NAME=OrderOps
NEXT_PUBLIC_ENABLE_SYRVE_DIAGNOSTICS=false
```

### 3. Start development server

```bash
npm run dev
```

Open: `http://localhost:3000`

## Available Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `NCB_INSTANCE` | Yes | NCB instance identifier used by the backend client |
| `NCB_DATA_API_URL` | Yes | Base URL for NCB data API |
| `NCB_AUTH_API_URL` | Yes | Base URL for NCB auth/session API |
| `NCB_SECRET_KEY` | Yes | Secret key used for server-side NCB requests |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application URL for redirects and browser-facing links |
| `UNIONE_API_KEY` | No | Email delivery integration key |
| `NOTIFICATION_SENDER_EMAIL` | No | Sender email for notifications |
| `NOTIFICATION_SENDER_NAME` | No | Sender display name |
| `NEXT_PUBLIC_ENABLE_SYRVE_DIAGNOSTICS` | No | Optional frontend diagnostic toggle |

## Development Notes

- The application uses **Next.js App Router**
- Data-fetching patterns are built around **TanStack React Query**
- UI is composed from **shadcn/ui** and **Radix UI** primitives
- State is coordinated through **React state**, **context**, and **Zustand** stores
- Integration/provider behavior is abstracted through hooks, constants, and provider-specific UI modules

## Positioning

OrderOps can be described as:

> A centralized restaurant operations platform for managing menus, orders, integrations, customer workflows, sync monitoring, QR menu sites, and account operations from one interface.

## Current Repository Status

This repository already includes a broad operational structure and product surface, but some domains may still be in active implementation or represented by scaffolding/stubbed data hooks. The README therefore reflects the **actual application structure and intended platform scope** present in the codebase.

## License

**Proprietary**

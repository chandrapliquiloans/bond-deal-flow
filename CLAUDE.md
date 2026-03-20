# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LiquiBonds** is a bond deal flow management SPA with three user portals:

- **Investor** — manage bond holdings, initiate sell orders, negotiate yields
- **IFA (Independent Financial Advisor)** — manage client portfolios and transactions
- **Ops** — process sell requests, manage RFQs, settle trades

> This is a client-side-only app. There is no backend. All data comes from `src/data/mockData.ts`.

---

## Dev Commands

```bash
bun run dev          # Start dev server at http://localhost:8080
bun run build        # Production build → /dist
bun run lint         # ESLint
bun run test         # Run unit tests (Vitest)
bun run test:watch   # Vitest watch mode
```

To run a single test file:
```bash
bunx vitest run src/test/example.test.ts
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 (SWC transpiler) |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v3 + CSS variables |
| Components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Server State | TanStack React Query v5 |
| Toasts | Sonner |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Playwright |

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives — do not edit manually
│   ├── investor/        # SellStepper.tsx, NegotiationDetail.tsx
│   ├── ops/             # OpsRequestDrawer.tsx
│   ├── Navigation.tsx   # TopNav + BottomNav (role-aware nav items)
│   ├── NavLink.tsx      # Active-state nav link helper
│   ├── PortalLayout.tsx # Wraps every page: TopNav + main + BottomNav
│   └── StatusBadge.tsx  # Status display badge
├── pages/
│   ├── investor/        # InvestorPortfolio, InvestorSellRequests, InvestorTransactions
│   ├── ifa/             # IFAClients, IFATransactions
│   ├── ops/             # OpsSellRequests, OpsTodaysTrades, OpsTrades
│   ├── LoginPage.tsx
│   └── NotFound.tsx
├── data/
│   └── mockData.ts      # All mock data — single source of truth
├── types/
│   └── index.ts         # All TypeScript interfaces and union types
├── lib/
│   └── utils.ts         # cn(), addWorkingDays(), isWorkingDay(), nextWorkingDay(), formatDate()
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── App.tsx              # Root: QueryClientProvider + BrowserRouter + route tree
├── main.tsx             # ReactDOM entry
└── index.css            # Global styles + CSS custom properties
```

---

## Routing (from `App.tsx`)

```
/                        → LoginPage
/investor                → redirect → /investor/portfolio
/investor/portfolio      → InvestorPortfolio
/investor/sell-requests  → InvestorSellRequests
/investor/transactions   → InvestorTransactions
/ifa                     → redirect → /ifa/clients
/ifa/clients             → IFAClients
/ifa/transactions        → IFATransactions
/ops                     → redirect → /ops/sell-requests
/ops/sell-requests       → OpsSellRequests
/ops/todays-trade        → OpsTodaysTrades
/ops/trades              → OpsTrades
*                        → NotFound
```

Authentication is demo-only — no real auth, no persistent session. Role is selected on the login page.

---

## Key Types (`src/types/index.ts`)

```ts
UserRole           = "investor" | "ifa" | "ops"
BondSource         = "liquibonds" | "external"

SellRequestStatus  = "sell_initiated" | "negotiation" | "buyer_approved" |
                     "seller_approved" | "rejected" | "payment_done" |
                     "processing" | "settled" | "terminated"

TradeRecord.status = "pending_payment" | "payment_uploaded" | "rfq_placed" | "settled"

Bond               // isin, name, couponRate, maturityDate, faceValue, creditRating, issuer
PurchaseOrder      // bond + units + availableUnits + purchasePrice/Date + orderId
SellRequest        // full sell order: bond, source, desiredYield, buyYield, transactionDate,
                   //   status, negotiationRounds[], settlementDate, utrNumber, rfqNumber
NegotiationRound   // round, proposedBy ("investor"|"ops"), yield, price, timestamp, deadline
IFAClient          // name, email, phone, panNumber, holdings: PurchaseOrder[]
TradeRecord        // settled trade: sellRequestId, bond, units, settledYield, settlementDate
```

---

## Mock Data (`src/data/mockData.ts`)

| Export | Contents |
|---|---|
| `BONDS_CATALOG` | 5 bonds: Reliance, HDFC, ICICI, Bajaj Finance, Tata Capital |
| `MOCK_PORTFOLIO` | 5 purchase orders with unit availability |
| `MOCK_SELL_REQUESTS` | 5 sell requests across multiple statuses with negotiation rounds |
| `MOCK_IFA_CLIENTS` | 3 IFA clients with holdings |
| `MOCK_TRADES` | 13 historical settled trades |

When adding features that need new data, add it to `mockData.ts` and type it in `types/index.ts`.

---

## Architecture Patterns

### Page Layout
Every page wraps its content in `<PortalLayout role="investor|ifa|ops">`. This renders `TopNav`, a `container` main, and `BottomNav` (mobile-only, fixed bottom).

### Drawers vs Modals
- **Right-side drawer**: fixed panel with `animate-slide-in-right` + backdrop overlay `bg-foreground/40`. Used for contextual actions (e.g. `OpsRequestDrawer`, external sell in `SellStepper`).
- **Centered modal**: `fixed inset-0 flex items-center justify-center` overlay. Used for internal sell in `SellStepper`.
- Do not use the shadcn `Sheet`/`Drawer` primitives for these — the custom pattern is intentional.

### State Management
No global state store. Pages hold local state via `useState`/`useMemo` and read directly from mock data. `React Query` is wired in `App.tsx` but not yet used for data fetching (no API calls).

---

## Styling Conventions

- Use **Tailwind utility classes** — no inline styles, no CSS modules.
- Use `cn()` from `src/lib/utils.ts` to merge conditional classes.
- Custom theme tokens in `src/index.css` — prefer over hardcoded colors:
  - Status colors: `text-success`, `text-warning`, `text-destructive`, `bg-success/10`
  - Semantic colors: `bg-card`, `bg-muted`, `text-muted-foreground`, `border-border`
- Dark mode uses the `class` strategy — test UI in both light and dark.
- Custom animations: `animate-slide-in-right`, `animate-check-mark`, `animate-fade-in`

---

## Component Conventions

- Prefer **shadcn/ui primitives** from `src/components/ui/` — do not re-implement buttons, inputs, dialogs, etc.
- Do not edit files in `src/components/ui/` directly — use shadcn CLI to add/update.
- Page components are route-level only — extract complex UI into `src/components/<portal>/`.

---

## Business Logic Notes

### Settlement Dates
- Settlement is always **T+2 working days** from transaction date.
- Use `addWorkingDays(date, 2)` from `src/lib/utils.ts`. Working days = Mon–Fri only (no holiday calendar).
- Non-working days must be snapped to `nextWorkingDay()`.
- Minimum transaction date is T+2 from today.

### Yield Validation
- Valid yield range: **4% – 25%** (enforced on all sell forms).

### T-Day Policy
- If negotiation is not resolved by the settlement date, the order auto-terminates at 00:00 IST.
- Always show the T-Day warning when a transaction date is displayed.

### Sell Flow (Internal vs External)
- **Internal** (`BondSource = "liquibonds"`): investor sells bonds bought through LiquiBonds — requires selecting a `PurchaseOrder` by `orderId`, enforces `availableUnits` cap.
- **External** (`BondSource = "external"`): investor sells bonds bought elsewhere — requires ISIN selection from `BONDS_CATALOG`, no unit cap.

---

## Path Alias

`@/` resolves to `src/` — use this everywhere:

```ts
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MOCK_PORTFOLIO } from "@/data/mockData"
```

---

## Testing

- Unit tests: `src/test/` — uses Vitest + Testing Library.
- E2E: configured via `playwright.config.ts`.
- Run `bun run test` before submitting changes to shared logic in `src/lib/` or `src/types/`.

---

## Docs

- [LiquiBonds Executive PRD](docs/LiquiBonds-Executive-PRD.md)
- [Phase 2 Implementation Guide](docs/LiquiBonds-Phase2-Implementation-Guide.md)

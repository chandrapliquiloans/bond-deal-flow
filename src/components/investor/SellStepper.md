# SellStepper Component

**File:** `src/components/investor/SellStepper.tsx`

## Overview

A sell order form component that supports two modes:

- **Internal** — sell bonds already held in the LiquiBonds portfolio (modal dialog)
- **External** — create a sell quote for bonds purchased from other vendors (right-side drawer)

## Props

| Prop | Type | Description |
|---|---|---|
| `type` | `"internal" \| "external"` | Determines which sell flow to render |
| `orderId` | `string \| null` | Portfolio order ID (used only in internal mode) |
| `onClose` | `() => void` | Callback to close the modal/drawer |

## State

| State | Type | Description |
|---|---|---|
| `unitsToSell` | `number` | Units to sell (internal mode) |
| `selectedIsin` | `string` | Selected bond ISIN (external mode) |
| `externalUnits` | `number` | Units to sell (external mode) |
| `desiredYield` | `string` | Desired yield percentage (shared) |
| `transactionDate` | `string` | Selected transaction date (shared) |
| `settlementDate` | `string` | Auto-calculated settlement date (shared) |
| `disclaimerChecked` | `boolean` | Disclaimer acceptance (shared) |
| `confirmed` | `boolean` | Whether the form has been submitted |

## Behavior

### Settlement Date Calculation

Settlement date is automatically computed as **T+2 working days** from the selected transaction date via a `useEffect` hook.

### Transaction Date Validation

- Minimum allowed date: T+2 working days from today
- Non-working days are automatically snapped to the next working day
- Displays a T-Day warning: orders auto-terminate at 00:00 IST if negotiation is unresolved

### Yield Validation

Desired yield must be between **4%** and **25%**.

### Submit Conditions

**Internal mode** (`canSubmitInternal`):
- Units to sell > 0 and ≤ available units
- Yield is valid (4–25%)
- Transaction date is valid
- Disclaimer is checked

**External mode** (`canSubmitExternal`):
- A bond ISIN is selected
- External units > 0
- Yield is valid (4–25%)
- Transaction date is valid
- Disclaimer is checked

## UI Modes

### Internal — Modal Dialog

- Centered overlay modal (`max-w-lg`)
- Displays order details: bond name, ISIN, purchase date/price, total/available/sold units
- Input for units to sell (capped to `availableUnits`)
- Shared fields: desired yield, settlement date
- On success: shows request ID `SR-006` with a confirmation message

### External — Right-Side Drawer

- Slides in from the right (`animate-slide-in-right`)
- ISIN dropdown from `BONDS_CATALOG` with bond detail preview
- Input for number of units
- Shared fields: desired yield, settlement date
- On success: shows request ID `SR-EXT-001` with a confirmation message

## Dependencies

| Import | Source |
|---|---|
| `MOCK_PORTFOLIO`, `BONDS_CATALOG` | `@/data/mockData` |
| `Bond` | `@/types` |
| `addWorkingDays`, `formatDate`, `isWorkingDay`, `nextWorkingDay` | `@/lib/utils` |
| `Button`, `Input`, `Label` | `@/components/ui/*` |
| `X`, `Check` | `lucide-react` |

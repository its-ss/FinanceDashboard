# FinanceFlow — Finance Dashboard UI

A clean, narrative-driven personal finance dashboard built as a frontend internship assignment. The goal was to go beyond a simple data display and create an interface that *tells a story* about your finances.

---

## Quick Start

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

To build for production:
```bash
npm run build
npm run preview
```

---

## Features

### Dashboard
- **3 Summary Cards** — Total Balance, Income, and Expenses with color-coded amounts (green/red/neutral)
- **Balance Trend Chart** — Area chart showing monthly income vs expenses with gradient fills. **Click any month point to filter transactions to that month**
- **Spending Breakdown** — Pie chart with interactive legend. **Click any category slice to filter transactions**
- Skeleton loaders on first render to demonstrate loading states

### Transactions
- **Full CRUD** — Add, edit, delete transactions (Admin role only)
- **Advanced Filtering** — Search, category dropdown, type toggle (all/income/expense), date range with validation
- **Sort** — By date, amount, or category (asc/desc toggle)
- **Active filter chips** — Visual indicators of active filters, individually clearable
- **Pagination** — 10 per page with page number display
- **Export** — Download filtered transactions as CSV or JSON
- **Keyboard shortcuts:**
  - `/` — Focus the search input
  - `A` — Open Add Transaction modal (Admin only)

### Insights (Financial Advisor Mode)
- **Narrative cards** — Dynamic text insights, not just raw numbers:
  - *"🍔 Food accounts for 32% of your spending — up 12% from last month"*
  - *"⚠️ You are on track to exceed your monthly budget by month end"*
  - *"📈 Your income is stable, but expenses have been rising"*
- **Budget Tracker** — Set a monthly limit, see animated progress bar (green → yellow → red at 70% and 90%), plus projected end-of-month spend
- **Month-over-Month comparison** — Side-by-side current vs previous month with % change indicator
- **Spending by Category** — Horizontal bar chart
- **Monthly Summary Table** — Full history with income/expenses/net per month
- **Best Month** — Highlights your most frugal month

### Role-Based UI
Switch between **Admin** and **Viewer** roles via the dropdown in the header:

| Feature | Viewer | Admin |
|---------|--------|-------|
| View all data | ✅ | ✅ |
| Add transactions | ❌ Disabled + tooltip | ✅ Keyboard shortcut: A |
| Edit/Delete | ❌ Disabled + tooltip | ✅ |
| Set budget | ❌ Disabled + tooltip | ✅ |
| Empty state message | "Contact an admin" | "Add your first transaction" |

Disabled buttons remain **visible** (not hidden) with tooltips explaining *why* they're restricted — a deliberate UX choice to make the permission model clear to users.

### Additional Features
- **Dark mode** — Full dark theme toggle, persisted across sessions
- **localStorage persistence** — All state (transactions, role, budget, dark mode) survives page refresh
- **Responsive** — Works from 320px mobile to 4K desktop. Sticky bottom nav on mobile, collapsible sidebar on desktop
- **Edge cases** — No transactions (role-aware messages), only-income/expense states, invalid date ranges, very large number formatting ($1.2M)

---

## Architecture

```
src/
├── types/          # TypeScript interfaces (Transaction, Role, Filter, etc.)
├── data/           # Mock data + category configuration (colors, hex values)
├── store/          # Zustand store with localStorage persist middleware
├── hooks/          # Business logic, decoupled from UI components
│   ├── useTransactions  # Filtered/sorted/paginated transactions (memoized)
│   └── useInsights      # Derived metrics + narrative strings (memoized)
├── utils/          # Pure functions: calculations, formatting, export
├── components/     # UI components organized by domain
│   ├── layout/     # Shell, sidebar, header, mobile bottom nav
│   ├── ui/         # Reusable primitives: skeleton, tooltip, progress bar, empty state
│   ├── dashboard/  # Charts and summary cards
│   ├── transactions/ # Table, filters, modal
│   └── insights/   # Narrative cards, budget tracker
└── pages/          # Route-level components (lazy loaded)
```

**Data flow:** `Store → Hooks (memoized) → Components`

Business logic is intentionally decoupled from UI. Components only handle rendering — all calculations and data transformations live in `hooks/` and `utils/`.

---

## Design Decisions

### Zustand over Redux
Zustand requires ~10x less boilerplate for the same functionality at this scale. The `persist` middleware gives localStorage integration in 2 lines. Redux would add complexity without benefit for a single-page dashboard.

### Tailwind CSS v4 over MUI or styled-components
Tailwind keeps styles co-located with markup (no context switching), enforces a consistent 8px spacing grid, and generates only the CSS classes actually used. MUI would constrain the design to Material patterns; styled-components adds a JS-in-CSS layer that complicates SSR and theming.

### Recharts over Chart.js or Victory
Recharts is built for React with a composable, declarative API. It supports `onClick` handlers on chart elements directly (used for interactive chart filtering), has excellent TypeScript types, and animates by default.

### Role simulation in frontend store
Roles are toggled in the UI for demonstration purposes. In a production system, role would come from a JWT/session and the store would be initialized from an auth context. The current approach correctly models the *behavior* (disabled states, tooltips, empty state variants) that a real RBAC system would produce.

---

## Trade-offs

| Decision | What I chose | What I'd do with more time |
|----------|-------------|---------------------------|
| Data source | Static mock data | Real REST/GraphQL API with React Query |
| State persistence | localStorage | IndexedDB for larger datasets |
| Testing | None | Vitest unit tests for hooks/utils + Playwright E2E |
| Auth | Frontend role toggle | JWT + protected routes |
| Charts interactivity | Click-to-navigate | Drill-down with animated transitions |

---

## What I'd Improve With More Time

1. **Unit tests** for all utility functions and custom hooks (`useTransactions`, `useInsights`)
2. **E2E tests** with Playwright covering the role-switch flow and chart interactions
3. **Real API** layer with React Query for caching, optimistic updates, and background refetch
4. **Recurring transactions** — auto-generate based on `isRecurring` flag
5. **Spending goals** — e.g. "Reduce Food by 20% this month" with progress tracking
6. **Notification system** — toast notifications on add/edit/delete actions
7. **Accessibility audit** — proper ARIA labels, focus management in modal, keyboard navigation in charts
8. **Bundle optimization** — route-level code splitting is in place; would add Sentry for error monitoring

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| State | Zustand 5 + persist middleware |
| Routing | React Router v7 |
| Icons | Lucide React |

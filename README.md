# Finance Dashboard

A personal finance dashboard built with React 18, TypeScript, Vite, and Tailwind CSS v4. Built as a frontend internship assignment — the goal was to create something that feels genuinely useful, not just a demo.

---

## Features

### Dashboard Overview
- **Summary cards** — current month income, expenses, net, and savings rate with month-over-month deltas
- **Area chart** — income vs expenses over the last 6 months; click a month to jump to filtered transactions
- **Pie chart** — spending breakdown by category; click a slice to filter by that category
- **Bar chart** — monthly income vs expenses comparison

### Transactions
- Full CRUD — add, edit, delete with undo (5-second undo toast, no confirm dialogs)
- **Search** by description or merchant with `/` keyboard shortcut to focus
- **Filter** by type (income/expense), category, and date range
- **Quick date shortcuts** — Today, This Week, This Month, Last Month, Last 3 Months, This Year
- **Sort** by date, amount, or category (ascending/descending)
- **Pagination** — 15 transactions per page
- **Export** — CSV or JSON export of filtered results
- **Bill upload** — upload a JPG, PNG, PDF, or Excel file; image/PDF previewed in-browser, Excel rows parsed and first row auto-fills the transaction form
- Active filter chips with individual clear buttons
- Active filter count visible in nav badge

### Insights
- **Narrative cards** — plain-English summaries like "🍔 Food accounts for 32% of your spending — up 12% from last month" and "✅ You're managing well — only 58% of your budget used this month"
- **Best month** — lowest expense month across all data
- **Spending risk** indicator (safe / warning / danger) based on budget usage
- **Top category** breakdown with month-over-month change

### Budget Tracker
- Set a monthly spending limit (admin only)
- Progress bar showing current month spend vs limit with projected end-of-month spend
- **Per-category limits** — collapsible section with inline edit for each expense category
- Over-limit categories highlighted in red with badge count on the section toggle
- All budget inputs validated with descriptive error messages

### Role-Based Access
- **Admin** — full access: add/edit/delete transactions, upload bills, set budgets and category limits, change role
- **Viewer** — read-only: all buttons disabled (not hidden) with tooltip explaining why
- Role toggle in the header for demo purposes

### UX Details
- Dark mode toggle (persisted to localStorage)
- Toast notification system with auto-dismiss and progress bar; destructive actions (delete) include an undo action
- Skeleton loaders on initial data render
- Keyboard shortcuts: `A` to open Add Transaction, `/` to focus search
- Mobile-responsive with bottom navigation on small screens
- Interactive charts navigate to filtered transactions on click
- All form inputs validated on blur with field-level error messages and green ✓ on valid fields

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-based config, no `tailwind.config.js`) |
| State | Zustand 5 with `persist` middleware |
| Charts | Recharts |
| Routing | React Router v7 (lazy-loaded pages) |
| Icons | Lucide React |
| Excel parsing | SheetJS (`xlsx`) |

---

## Project Structure

```
src/
├── components/
│   ├── charts/          # AreaChart, PieChart, BarChart wrappers
│   ├── dashboard/       # SummaryCards, InsightsSection
│   ├── insights/        # BudgetTracker, InsightCard
│   ├── transactions/    # TransactionList, TransactionModal, TransactionFilters,
│   │                    # DateShortcuts, BillUploadModal
│   ├── ui/              # Toast, ProgressBar, Skeleton, Tooltip
│   └── layout/          # Sidebar, MobileNav, Header
├── data/
│   └── mockData.ts      # 63 mock transactions + category config
├── hooks/
│   ├── useTransactions.ts  # filtering, sorting, pagination
│   └── useInsights.ts      # narrative generation, budget metrics
├── pages/
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   └── InsightsPage.tsx
├── store/
│   └── useStore.ts      # Zustand store (transactions, budget, filters, toasts)
├── types/
│   └── index.ts         # All TypeScript interfaces
└── utils/
    ├── calculations.ts  # Monthly totals, category grouping, projections
    ├── validations.ts   # Reusable field validators (amount, date, description…)
    ├── billParser.ts    # Excel file parsing with column auto-detection
    └── export.ts        # CSV / JSON export
```

---

## Design Decisions

**Business logic decoupled from components.** `useTransactions` and `useInsights` are custom hooks that do all computation (filtering, sorting, narrative generation) via `useMemo`. Components only render — they don't contain conditional logic about what data to show.

**Validation on blur, not on keystroke.** Errors appear after a field loses focus, not while typing. The `touched` map tracks which fields have been visited. On form submit, all fields are marked touched at once so all errors appear simultaneously.

**Undo delete instead of confirm dialogs.** Deleting a transaction immediately removes it from the UI and starts a 5-second timer. An undo toast lets the user recover it. This feels faster than a modal confirm and is equally safe.

**Per-category budget limits as a collapsible section.** Budget limits per category are a power-user feature. Collapsing them by default keeps the BudgetTracker card clean while making the feature discoverable via a toggle that shows "N over limit" when relevant.

**Tailwind v4 instead of v3.** The v4 API is CSS-first (`@import "tailwindcss"` in the stylesheet, `@custom-variant` for dark mode). There is no `tailwind.config.js`. Dark mode is implemented as a `.dark` class on `<html>` managed by Zustand.

**No OCR or backend for bill upload.** The bill upload feature is entirely frontend. Images and PDFs are previewed using `URL.createObjectURL` (native browser API, no library). Excel files are parsed with SheetJS using keyword-based column detection (headers containing "amount", "date", "description", etc.) to suggest pre-fill values.

---

## Trade-offs

- **Mock data only** — no API, no persistence beyond `localStorage`. Adding a real backend would require replacing the Zustand store actions with async fetch calls and handling loading/error states.
- **SheetJS bundle size** — the `xlsx` library adds ~200 KB to the bundle. Acceptable for an internal dashboard; for a public product, dynamically importing it only when the upload modal opens would be better.
- **No virtualization** — the transaction list paginates at 15 rows. With tens of thousands of rows this would need `react-window` or similar.
- **Role stored in memory** — switching Admin/Viewer is a UI demo toggle. In a real app, role would come from an auth token and not be changeable client-side.

---

## What I'd Improve

- **Real backend + auth** — replace Zustand persist with server state (React Query / SWR), add JWT auth, persist budget limits server-side
- **Actual OCR** — use Tesseract.js or a cloud Vision API to extract text from image/PDF bills automatically
- **Recurring transactions** — detect and flag regular payments (subscriptions, rent), project them in the budget tracker
- **Multi-currency support** — store a currency field per transaction, show converted totals in user's preferred currency
- **Lazy-load xlsx** — `import('xlsx')` dynamically inside BillUploadModal to keep the initial bundle smaller
- **E2E tests** — Playwright tests for the key flows (add transaction, upload bill, set budget, export)

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Toggle between Admin and Viewer roles using the button in the top-right corner.

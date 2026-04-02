import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, FilterState, Role, Budget, ToastItem, ToastVariant } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/mockData';

interface PendingDeleteEntry {
  transaction: Transaction;
  timerId: ReturnType<typeof setTimeout>;
}

interface AppState {
  // Data
  transactions: Transaction[];

  // Pending deletes (undo window)
  pendingDeletes: Record<string, PendingDeleteEntry>;

  // Filters
  filters: FilterState;

  // Role
  role: Role;

  // UI
  darkMode: boolean;

  // Budget
  budget: Budget;

  // Pagination
  currentPage: number;

  // Toasts
  toasts: ToastItem[];

  // Actions
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string, onUndo?: () => void) => void;
  undoDelete: (id: string) => void;
  finalizeDelete: (id: string) => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  setRole: (role: Role) => void;
  toggleDarkMode: () => void;
  setBudget: (limit: number) => void;
  setCategoryLimit: (category: string, limit: number) => void;
  removeCategoryLimit: (category: string) => void;
  setCurrentPage: (page: number) => void;
  addToast: (message: string, variant?: ToastVariant, action?: ToastItem['action']) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: '',
  type: 'all',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
  selectedMonth: null,
};

function generateToastId() {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: INITIAL_TRANSACTIONS,
      pendingDeletes: {},
      filters: DEFAULT_FILTERS,
      role: 'admin',
      darkMode: false,
      budget: { monthlyLimit: 0, categoryLimits: {} },
      currentPage: 1,
      toasts: [],

      addTransaction: (t) =>
        set((state) => ({ transactions: [t, ...state.transactions] })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTransaction: (id, onUndo) => {
        const state = get();
        const transaction = state.transactions.find((t) => t.id === id);
        if (!transaction) return;

        // Schedule actual removal after 5s
        const timerId = setTimeout(() => {
          get().finalizeDelete(id);
        }, 5000);

        set((s) => ({
          // Remove from visible transactions immediately
          transactions: s.transactions.filter((t) => t.id !== id),
          pendingDeletes: {
            ...s.pendingDeletes,
            [id]: { transaction, timerId },
          },
        }));

        // Show undo toast
        const toastId = generateToastId();
        set((s) => ({
          toasts: [
            ...s.toasts,
            {
              id: toastId,
              message: `"${transaction.description}" deleted`,
              variant: 'warning',
              action: {
                label: 'Undo',
                onClick: () => {
                  onUndo?.();
                  get().undoDelete(id);
                  get().removeToast(toastId);
                },
              },
            },
          ],
        }));

        // Auto-remove the toast after 5s too
        setTimeout(() => get().removeToast(toastId), 5000);
      },

      undoDelete: (id) => {
        const { pendingDeletes } = get();
        const entry = pendingDeletes[id];
        if (!entry) return;

        clearTimeout(entry.timerId);

        set((s) => {
          const { [id]: _, ...rest } = s.pendingDeletes;
          return {
            transactions: [entry.transaction, ...s.transactions],
            pendingDeletes: rest,
          };
        });
      },

      finalizeDelete: (id) => {
        set((s) => {
          const { [id]: _, ...rest } = s.pendingDeletes;
          return { pendingDeletes: rest };
        });
      },

      setFilters: (f) =>
        set((state) => ({
          filters: { ...state.filters, ...f },
          currentPage: 1,
        })),

      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS, currentPage: 1 }),

      setRole: (role) => set({ role }),

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: next };
        }),

      setBudget: (limit) =>
        set((state) => ({
          budget: { ...state.budget, monthlyLimit: limit },
        })),

      setCategoryLimit: (category, limit) =>
        set((state) => ({
          budget: {
            ...state.budget,
            categoryLimits: { ...state.budget.categoryLimits, [category]: limit },
          },
        })),

      removeCategoryLimit: (category) =>
        set((state) => {
          const { [category]: _, ...rest } = state.budget.categoryLimits;
          return { budget: { ...state.budget, categoryLimits: rest } };
        }),

      setCurrentPage: (page) => set({ currentPage: page }),

      addToast: (message, variant = 'info', action) => {
        const id = generateToastId();
        set((s) => ({
          toasts: [...s.toasts, { id, message, variant, action }],
        }));
        // Auto-dismiss after 4s (unless it has an undo action managed externally)
        if (!action) {
          setTimeout(() => get().removeToast(id), 4000);
        }
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'finance-dashboard-store',
      partialize: (state) => ({
        transactions: state.transactions,
        role: state.role,
        darkMode: state.darkMode,
        budget: state.budget,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
        // Migrate old budget shape (no categoryLimits)
        if (state?.budget && !state.budget.categoryLimits) {
          state.budget.categoryLimits = {};
        }
      },
    }
  )
);

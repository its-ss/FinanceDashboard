import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, FilterState, Role, Budget } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/mockData';

interface AppState {
  // Data
  transactions: Transaction[];

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

  // Actions
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  setRole: (role: Role) => void;
  toggleDarkMode: () => void;
  setBudget: (limit: number) => void;
  setCurrentPage: (page: number) => void;
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

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: INITIAL_TRANSACTIONS,
      filters: DEFAULT_FILTERS,
      role: 'admin',
      darkMode: false,
      budget: { monthlyLimit: 0 },
      currentPage: 1,

      addTransaction: (t) =>
        set((state) => ({ transactions: [t, ...state.transactions] })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

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

      setBudget: (limit) => set({ budget: { monthlyLimit: limit } }),

      setCurrentPage: (page) => set({ currentPage: page }),
    }),
    {
      name: 'finance-dashboard-store',
      onRehydrateStorage: () => (state) => {
        // Apply dark mode class on rehydration
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);

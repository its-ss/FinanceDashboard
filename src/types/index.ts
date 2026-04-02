export type TransactionType = 'income' | 'expense';
export type Role = 'admin' | 'viewer';
export type SortBy = 'date' | 'amount' | 'category';
export type SortOrder = 'asc' | 'desc';
export type FilterType = 'all' | TransactionType;
export type SpendingRisk = 'safe' | 'warning' | 'danger';

export interface Transaction {
  id: string;
  date: string; // ISO date string
  amount: number; // always positive
  type: TransactionType;
  category: string;
  description: string;
  merchant?: string;
  isRecurring?: boolean;
}

export interface CategoryConfig {
  name: string;
  color: string; // Tailwind bg color class
  hexColor: string; // For Recharts
  textColor: string; // Tailwind text color
  lightBg: string; // Light background for badge
}

export interface Budget {
  monthlyLimit: number;
}

export interface FilterState {
  search: string;
  category: string;
  type: FilterType;
  dateFrom: string;
  dateTo: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedMonth: string | null;
}

export interface MonthlyTotal {
  month: string; // "Jan 26"
  monthKey: string; // "2026-01"
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
  hexColor: string;
  color: string;
}

export interface InsightData {
  topCategoryNarrative: string;
  budgetStatusNarrative: string;
  trendNarrative: string;
  bestMonth: string;
  spendingRisk: SpendingRisk;
  topCategory: string;
  topCategoryAmount: number;
  topCategoryPercent: number;
  topCategoryChange: number;
  currentMonthExpenses: number;
  previousMonthExpenses: number;
  monthOverMonthChange: number;
  projectedMonthlySpend: number;
  budgetUsagePercent: number;
}

import type { Transaction, MonthlyTotal, CategoryTotal } from '../types';
import { CATEGORY_CONFIG } from '../data/mockData';

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // "2026-03"
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function calculateMonthlyTotals(transactions: Transaction[]): MonthlyTotal[] {
  const map = new Map<string, { income: number; expenses: number }>();

  for (const t of transactions) {
    const key = getMonthKey(t.date);
    const existing = map.get(key) ?? { income: 0, expenses: 0 };
    if (t.type === 'income') existing.income += t.amount;
    else existing.expenses += t.amount;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expenses }]) => ({
      month: getMonthLabel(key),
      monthKey: key,
      income,
      expenses,
      net: income - expenses,
    }));
}

export function groupByCategory(transactions: Transaction[]): CategoryTotal[] {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<string, number>();
  for (const t of expenseTransactions) {
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }

  return Array.from(map.entries())
    .map(([category, categoryTotal]) => ({
      category,
      total: categoryTotal,
      percentage: total > 0 ? Math.round((categoryTotal / total) * 100) : 0,
      hexColor: CATEGORY_CONFIG[category]?.hexColor ?? '#6b7280',
      color: CATEGORY_CONFIG[category]?.color ?? 'bg-gray-500',
    }))
    .sort((a, b) => b.total - a.total);
}

export function getMonthOverMonthChange(
  transactions: Transaction[],
  currentMonthKey: string,
  prevMonthKey: string,
  category?: string
): { current: number; previous: number; percentChange: number } {
  const filter = (t: Transaction, monthKey: string) =>
    t.type === 'expense' &&
    getMonthKey(t.date) === monthKey &&
    (!category || t.category === category);

  const current = transactions.filter(t => filter(t, currentMonthKey)).reduce((s, t) => s + t.amount, 0);
  const previous = transactions.filter(t => filter(t, prevMonthKey)).reduce((s, t) => s + t.amount, 0);
  const percentChange = previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);

  return { current, previous, percentChange };
}

export function getTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
}

export function getCurrentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getPreviousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getProjectedMonthlySpend(transactions: Transaction[], monthKey: string): number {
  const today = new Date();
  const [year, month] = monthKey.split('-').map(Number);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  if (!isCurrentMonth) return 0;

  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(year, month, 0).getDate();

  const spent = transactions
    .filter(t => t.type === 'expense' && getMonthKey(t.date) === monthKey)
    .reduce((sum, t) => sum + t.amount, 0);

  return dayOfMonth > 0 ? (spent / dayOfMonth) * daysInMonth : 0;
}

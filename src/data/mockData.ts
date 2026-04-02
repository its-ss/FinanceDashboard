import type { Transaction, CategoryConfig } from '../types';

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // Expense categories
  Food: { name: 'Food', color: 'bg-orange-500', hexColor: '#f97316', textColor: 'text-orange-600', lightBg: 'bg-orange-100 dark:bg-orange-900/30' },
  Transport: { name: 'Transport', color: 'bg-blue-500', hexColor: '#3b82f6', textColor: 'text-blue-600', lightBg: 'bg-blue-100 dark:bg-blue-900/30' },
  Housing: { name: 'Housing', color: 'bg-purple-500', hexColor: '#a855f7', textColor: 'text-purple-600', lightBg: 'bg-purple-100 dark:bg-purple-900/30' },
  Entertainment: { name: 'Entertainment', color: 'bg-pink-500', hexColor: '#ec4899', textColor: 'text-pink-600', lightBg: 'bg-pink-100 dark:bg-pink-900/30' },
  Health: { name: 'Health', color: 'bg-red-500', hexColor: '#ef4444', textColor: 'text-red-600', lightBg: 'bg-red-100 dark:bg-red-900/30' },
  Shopping: { name: 'Shopping', color: 'bg-yellow-500', hexColor: '#eab308', textColor: 'text-yellow-600', lightBg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  Utilities: { name: 'Utilities', color: 'bg-cyan-500', hexColor: '#06b6d4', textColor: 'text-cyan-600', lightBg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  Other: { name: 'Other', color: 'bg-gray-500', hexColor: '#6b7280', textColor: 'text-gray-600', lightBg: 'bg-gray-100 dark:bg-gray-900/30' },
  // Income categories
  Salary: { name: 'Salary', color: 'bg-green-500', hexColor: '#22c55e', textColor: 'text-green-600', lightBg: 'bg-green-100 dark:bg-green-900/30' },
  Freelance: { name: 'Freelance', color: 'bg-emerald-500', hexColor: '#10b981', textColor: 'text-emerald-600', lightBg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  Investment: { name: 'Investment', color: 'bg-teal-500', hexColor: '#14b8a6', textColor: 'text-teal-600', lightBg: 'bg-teal-100 dark:bg-teal-900/30' },
};

export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other'];
export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // November 2025
  { id: '1', date: '2025-11-01', amount: 4200, type: 'income', category: 'Salary', description: 'Monthly salary', merchant: 'Acme Corp', isRecurring: true },
  { id: '2', date: '2025-11-03', amount: 1200, type: 'expense', category: 'Housing', description: 'Rent payment', merchant: 'Landlord', isRecurring: true },
  { id: '3', date: '2025-11-05', amount: 85.50, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Whole Foods' },
  { id: '4', date: '2025-11-07', amount: 45, type: 'expense', category: 'Transport', description: 'Monthly bus pass', merchant: 'City Transit', isRecurring: true },
  { id: '5', date: '2025-11-10', amount: 320, type: 'income', category: 'Freelance', description: 'Website design project', merchant: 'Client A' },
  { id: '6', date: '2025-11-12', amount: 62.30, type: 'expense', category: 'Food', description: 'Restaurant dinner', merchant: 'The Olive Garden' },
  { id: '7', date: '2025-11-15', amount: 89, type: 'expense', category: 'Utilities', description: 'Electricity bill', merchant: 'Power Co', isRecurring: true },
  { id: '8', date: '2025-11-18', amount: 150, type: 'expense', category: 'Shopping', description: 'Winter clothes', merchant: 'H&M' },
  { id: '9', date: '2025-11-20', amount: 35, type: 'expense', category: 'Entertainment', description: 'Netflix + Spotify', merchant: 'Streaming', isRecurring: true },
  { id: '10', date: '2025-11-22', amount: 420, type: 'income', category: 'Investment', description: 'Dividend payment', merchant: 'Vanguard' },
  { id: '11', date: '2025-11-25', amount: 78.40, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Trader Joes' },
  { id: '12', date: '2025-11-28', amount: 55, type: 'expense', category: 'Health', description: 'Gym membership', merchant: 'FitLife', isRecurring: true },

  // December 2025
  { id: '13', date: '2025-12-01', amount: 4200, type: 'income', category: 'Salary', description: 'Monthly salary', merchant: 'Acme Corp', isRecurring: true },
  { id: '14', date: '2025-12-03', amount: 1200, type: 'expense', category: 'Housing', description: 'Rent payment', merchant: 'Landlord', isRecurring: true },
  { id: '15', date: '2025-12-05', amount: 92, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Whole Foods' },
  { id: '16', date: '2025-12-08', amount: 680, type: 'income', category: 'Freelance', description: 'App development', merchant: 'Client B' },
  { id: '17', date: '2025-12-10', amount: 245, type: 'expense', category: 'Shopping', description: 'Holiday gifts', merchant: 'Amazon' },
  { id: '18', date: '2025-12-12', amount: 45, type: 'expense', category: 'Transport', description: 'Monthly bus pass', merchant: 'City Transit', isRecurring: true },
  { id: '19', date: '2025-12-14', amount: 120, type: 'expense', category: 'Entertainment', description: 'Concert tickets', merchant: 'Ticketmaster' },
  { id: '20', date: '2025-12-16', amount: 84, type: 'expense', category: 'Utilities', description: 'Electricity bill', merchant: 'Power Co', isRecurring: true },
  { id: '21', date: '2025-12-20', amount: 175, type: 'expense', category: 'Shopping', description: 'New shoes', merchant: 'Nike' },
  { id: '22', date: '2025-12-22', amount: 110.50, type: 'expense', category: 'Food', description: 'Holiday dinner', merchant: 'Prime Steakhouse' },
  { id: '23', date: '2025-12-26', amount: 55, type: 'expense', category: 'Health', description: 'Gym membership', merchant: 'FitLife', isRecurring: true },
  { id: '24', date: '2025-12-28', amount: 95, type: 'expense', category: 'Food', description: 'New Year groceries', merchant: 'Whole Foods' },

  // January 2026
  { id: '25', date: '2026-01-01', amount: 4200, type: 'income', category: 'Salary', description: 'Monthly salary', merchant: 'Acme Corp', isRecurring: true },
  { id: '26', date: '2026-01-03', amount: 1200, type: 'expense', category: 'Housing', description: 'Rent payment', merchant: 'Landlord', isRecurring: true },
  { id: '27', date: '2026-01-06', amount: 78, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Trader Joes' },
  { id: '28', date: '2026-01-08', amount: 45, type: 'expense', category: 'Transport', description: 'Monthly bus pass', merchant: 'City Transit', isRecurring: true },
  { id: '29', date: '2026-01-10', amount: 320, type: 'income', category: 'Freelance', description: 'Logo design', merchant: 'Client C' },
  { id: '30', date: '2026-01-12', amount: 92, type: 'expense', category: 'Utilities', description: 'Electricity bill', merchant: 'Power Co', isRecurring: true },
  { id: '31', date: '2026-01-15', amount: 55, type: 'expense', category: 'Health', description: 'Gym membership', merchant: 'FitLife', isRecurring: true },
  { id: '32', date: '2026-01-17', amount: 38.90, type: 'expense', category: 'Food', description: 'Coffee & lunch', merchant: 'Cafe Central' },
  { id: '33', date: '2026-01-20', amount: 380, type: 'income', category: 'Investment', description: 'Dividend payment', merchant: 'Vanguard' },
  { id: '34', date: '2026-01-22', amount: 65, type: 'expense', category: 'Entertainment', description: 'Movie night + dinner', merchant: 'AMC Theaters' },
  { id: '35', date: '2026-01-25', amount: 82, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Whole Foods' },
  { id: '36', date: '2026-01-28', amount: 120, type: 'expense', category: 'Shopping', description: 'Books & stationery', merchant: 'Barnes & Noble' },

  // February 2026
  { id: '37', date: '2026-02-01', amount: 4200, type: 'income', category: 'Salary', description: 'Monthly salary', merchant: 'Acme Corp', isRecurring: true },
  { id: '38', date: '2026-02-03', amount: 1200, type: 'expense', category: 'Housing', description: 'Rent payment', merchant: 'Landlord', isRecurring: true },
  { id: '39', date: '2026-02-05', amount: 88, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Whole Foods' },
  { id: '40', date: '2026-02-07', amount: 45, type: 'expense', category: 'Transport', description: 'Monthly bus pass', merchant: 'City Transit', isRecurring: true },
  { id: '41', date: '2026-02-10', amount: 185, type: 'expense', category: 'Shopping', description: "Valentine's gift", merchant: 'Jewelry Co' },
  { id: '42', date: '2026-02-12', amount: 97, type: 'expense', category: 'Utilities', description: 'Electricity bill', merchant: 'Power Co', isRecurring: true },
  { id: '43', date: '2026-02-14', amount: 145, type: 'expense', category: 'Food', description: "Valentine's dinner", merchant: 'Le Petit Bistro' },
  { id: '44', date: '2026-02-15', amount: 55, type: 'expense', category: 'Health', description: 'Gym membership', merchant: 'FitLife', isRecurring: true },
  { id: '45', date: '2026-02-18', amount: 550, type: 'income', category: 'Freelance', description: 'Mobile app UI', merchant: 'Client D' },
  { id: '46', date: '2026-02-20', amount: 72, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Trader Joes' },
  { id: '47', date: '2026-02-22', amount: 95, type: 'expense', category: 'Entertainment', description: 'Weekend trip expenses', merchant: 'Various' },
  { id: '48', date: '2026-02-25', amount: 49, type: 'expense', category: 'Health', description: 'Doctor co-pay', merchant: 'City Clinic' },

  // March 2026
  { id: '49', date: '2026-03-01', amount: 4200, type: 'income', category: 'Salary', description: 'Monthly salary', merchant: 'Acme Corp', isRecurring: true },
  { id: '50', date: '2026-03-03', amount: 1200, type: 'expense', category: 'Housing', description: 'Rent payment', merchant: 'Landlord', isRecurring: true },
  { id: '51', date: '2026-03-05', amount: 95, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Whole Foods' },
  { id: '52', date: '2026-03-07', amount: 45, type: 'expense', category: 'Transport', description: 'Monthly bus pass', merchant: 'City Transit', isRecurring: true },
  { id: '53', date: '2026-03-10', amount: 102, type: 'expense', category: 'Utilities', description: 'Electricity bill', merchant: 'Power Co', isRecurring: true },
  { id: '54', date: '2026-03-12', amount: 125, type: 'expense', category: 'Food', description: 'Dining out (3x)', merchant: 'Various' },
  { id: '55', date: '2026-03-14', amount: 55, type: 'expense', category: 'Health', description: 'Gym membership', merchant: 'FitLife', isRecurring: true },
  { id: '56', date: '2026-03-16', amount: 460, type: 'income', category: 'Investment', description: 'Stock dividend', merchant: 'Fidelity' },
  { id: '57', date: '2026-03-18', amount: 220, type: 'expense', category: 'Shopping', description: 'Spring wardrobe', merchant: 'Zara' },
  { id: '58', date: '2026-03-20', amount: 88, type: 'expense', category: 'Food', description: 'Grocery shopping', merchant: 'Trader Joes' },
  { id: '59', date: '2026-03-22', amount: 72, type: 'expense', category: 'Entertainment', description: 'Concerts & events', merchant: 'Various' },
  { id: '60', date: '2026-03-25', amount: 750, type: 'income', category: 'Freelance', description: 'Dashboard UI project', merchant: 'Client E' },
  { id: '61', date: '2026-03-28', amount: 38, type: 'expense', category: 'Food', description: 'Coffee & snacks', merchant: 'Starbucks' },

  // April 2026
  { id: '62', date: '2026-04-01', amount: 4200, type: 'income', category: 'Salary', description: 'Monthly salary', merchant: 'Acme Corp', isRecurring: true },
  { id: '63', date: '2026-04-02', amount: 1200, type: 'expense', category: 'Housing', description: 'Rent payment', merchant: 'Landlord', isRecurring: true },
];

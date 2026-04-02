import type { Transaction } from '../types';
import { formatDate } from './calculations';

export function exportToCSV(transactions: Transaction[], filename = 'transactions'): void {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Merchant'];
  const rows = transactions.map(t => [
    formatDate(t.date),
    `"${t.description}"`,
    t.category,
    t.type,
    t.type === 'income' ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`,
    `"${t.merchant ?? ''}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(transactions: Transaction[], filename = 'transactions'): void {
  const data = JSON.stringify(transactions, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

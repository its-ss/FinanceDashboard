import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { TransactionRow } from './TransactionRow';
import { EmptyState } from '../ui/EmptyState';
import type { Transaction } from '../../types';

interface TransactionListProps {
  paginatedTransactions: Transaction[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasActiveFilters: boolean;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onResetFilters: () => void;
  onAddNew: () => void;
}

export function TransactionList({
  paginatedTransactions, totalCount, currentPage, totalPages,
  hasActiveFilters, onEdit, onDelete, onResetFilters, onAddNew,
}: TransactionListProps) {
  const role = useStore((s) => s.role);
  const setCurrentPage = useStore((s) => s.setCurrentPage);

  // Empty state
  if (totalCount === 0) {
    if (hasActiveFilters) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <EmptyState
            title="No transactions match your filters"
            description="Try adjusting your search or filter criteria"
            action={
              <button onClick={onResetFilters} className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                Clear filters
              </button>
            }
          />
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {role === 'admin' ? (
          <EmptyState
            title="No transactions yet"
            description="Start by adding your first transaction to track your finances"
            action={
              <button onClick={onAddNew} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                Add your first transaction
              </button>
            }
          />
        ) : (
          <EmptyState
            title="No transactions yet"
            description="You don't have permission to add transactions. Contact an admin."
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden fade-in">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Category</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Type</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                role={role}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {((currentPage - 1) * 10) + 1}–{Math.min(currentPage * 10, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - currentPage) <= 2)
              .map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                    p === currentPage
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

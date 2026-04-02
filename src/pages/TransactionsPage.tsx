import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Download, ChevronDown, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { BillUploadModal } from '../components/transactions/BillUploadModal';
import { Tooltip } from '../components/ui/Tooltip';
import { exportToCSV, exportToJSON } from '../utils/export';
import type { Transaction } from '../types';

export default function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const role = useStore((s) => s.role);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const addToast = useStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [billUploadOpen, setBillUploadOpen] = useState(false);

  const { filteredTransactions, paginatedTransactions, totalCount, totalPages, currentPage, dateRangeInvalid } = useTransactions();

  // Apply URL params (from chart clicks)
  useEffect(() => {
    const month = searchParams.get('month');
    const category = searchParams.get('category');
    if (month) setFilters({ selectedMonth: month });
    if (category) setFilters({ category });
  }, [searchParams]);

  // Keyboard shortcut: 'A' opens add modal (admin only)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'a' &&
        role === 'admin' &&
        !modalOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setModalOpen(true);
        setEditingTransaction(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [role, modalOpen]);

  const filters = useStore((s) => s.filters);
  const hasActiveFilters =
    !!filters.search || !!filters.category || filters.type !== 'all' ||
    !!filters.dateFrom || !!filters.dateTo || !!filters.selectedMonth;

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // No confirm dialog — undo toast handles recovery
    deleteTransaction(id);
  };

  const handleModalClose = (saved?: boolean, action?: 'add' | 'edit') => {
    setModalOpen(false);
    setEditingTransaction(null);
    if (saved) {
      if (action === 'add') addToast('Transaction added', 'success');
      else if (action === 'edit') addToast('Transaction updated', 'success');
    }
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, 'transactions');
    setShowExportMenu(false);
    addToast(`Exported ${filteredTransactions.length} transactions as CSV`, 'success');
  };

  const handleExportJSON = () => {
    exportToJSON(filteredTransactions, 'transactions');
    setShowExportMenu(false);
    addToast(`Exported ${filteredTransactions.length} transactions as JSON`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {totalCount} transaction{totalCount !== 1 ? 's' : ''} {hasActiveFilters ? '(filtered)' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-36">
                  <button onClick={handleExportCSV} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Export as CSV
                  </button>
                  <button onClick={handleExportJSON} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Export as JSON
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Upload Bill */}
          {role === 'admin' ? (
            <button
              onClick={() => setBillUploadOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Upload bill (image, PDF, or Excel)"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Bill</span>
            </button>
          ) : (
            <Tooltip content="Only admins can upload bills">
              <button
                disabled
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Bill</span>
              </button>
            </Tooltip>
          )}

          {/* Add button */}
          {role === 'admin' ? (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all active:scale-95"
              title="Add transaction (A)"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
              <kbd className="hidden lg:inline-block text-xs bg-indigo-700 px-1.5 py-0.5 rounded">A</kbd>
            </button>
          ) : (
            <Tooltip content="Only admins can add transactions">
              <button
                disabled
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Transaction</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <TransactionFilters dateRangeInvalid={dateRangeInvalid} />
      </div>

      {/* List */}
      <TransactionList
        paginatedTransactions={paginatedTransactions}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        hasActiveFilters={hasActiveFilters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetFilters={resetFilters}
        onAddNew={handleAddNew}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        transaction={editingTransaction}
      />

      {/* Bill Upload Modal */}
      <BillUploadModal
        isOpen={billUploadOpen}
        onClose={() => setBillUploadOpen(false)}
      />
    </div>
  );
}

import { useRef, useEffect } from 'react';
import { Search, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../data/mockData';
import type { FilterType, SortBy } from '../../types';

interface TransactionFiltersProps {
  dateRangeInvalid?: boolean;
}

export function TransactionFilters({ dateRangeInvalid }: TransactionFiltersProps) {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const hasActiveFilters =
    !!filters.search || !!filters.category || filters.type !== 'all' ||
    !!filters.dateFrom || !!filters.dateTo || !!filters.selectedMonth;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search transactions... (/)"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {filters.search && (
            <button onClick={() => setFilters({ search: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
          {(['all', 'income', 'expense'] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ type: t })}
              className={`px-3 py-2 text-xs font-medium capitalize transition-all
                ${filters.type === t
                  ? t === 'all' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : t === 'income' ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">All Categories</option>
            <optgroup label="Expenses">
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Income">
              {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative flex items-center gap-1">
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ sortBy: e.target.value as SortBy })}
              className="appearance-none pl-3 pr-7 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={() => setFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            <ArrowUpDown className={`w-4 h-4 transition-transform ${filters.sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'} text-gray-500`} />
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date range:</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ dateFrom: e.target.value })}
          className={`px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
            ${dateRangeInvalid ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
        />
        <span className="text-xs text-gray-400">to</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ dateTo: e.target.value })}
          className={`px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
            ${dateRangeInvalid ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
        />
        {dateRangeInvalid && (
          <span className="text-xs text-red-500 dark:text-red-400 font-medium">From date must be before To date</span>
        )}

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <X className="w-3 h-3" />
            Clear all filters
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {(filters.selectedMonth || filters.category || filters.type !== 'all') && (
        <div className="flex flex-wrap gap-2">
          {filters.selectedMonth && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              Month: {filters.selectedMonth}
              <button onClick={() => setFilters({ selectedMonth: null })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Category: {filters.category}
              <button onClick={() => setFilters({ category: '' })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.type !== 'all' && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${filters.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
              {filters.type}
              <button onClick={() => setFilters({ type: 'all' })}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getMonthKey } from '../utils/calculations';

const PAGE_SIZE = 10;

export function useTransactions() {
  const transactions = useStore((s) => s.transactions);
  const filters = useStore((s) => s.filters);
  const currentPage = useStore((s) => s.currentPage);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.merchant?.toLowerCase().includes(q) ?? false)
      );
    }

    // Category
    if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }

    // Type
    if (filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }

    // Date range validation — only filter if from <= to
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;
    const dateRangeValid = !dateFrom || !dateTo || dateFrom <= dateTo;

    if (dateRangeValid) {
      if (dateFrom) result = result.filter((t) => t.date >= dateFrom);
      if (dateTo) result = result.filter((t) => t.date <= dateTo);
    }

    // Selected month (from chart click)
    if (filters.selectedMonth) {
      result = result.filter((t) => getMonthKey(t.date) === filters.selectedMonth);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (filters.sortBy === 'date') cmp = a.date.localeCompare(b.date);
      else if (filters.sortBy === 'amount') cmp = a.amount - b.amount;
      else if (filters.sortBy === 'category') cmp = a.category.localeCompare(b.category);
      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [transactions, filters]);

  const totalCount = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(
    () => filteredTransactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredTransactions, safePage]
  );

  const dateRangeInvalid =
    !!filters.dateFrom && !!filters.dateTo && filters.dateFrom > filters.dateTo;

  return {
    filteredTransactions,
    paginatedTransactions,
    totalCount,
    totalPages,
    currentPage: safePage,
    pageSize: PAGE_SIZE,
    dateRangeInvalid,
  };
}

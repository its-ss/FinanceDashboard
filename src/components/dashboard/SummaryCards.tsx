import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { getTotalBalance, getTotalIncome, getTotalExpenses } from '../../utils/calculations';
import { SummaryCard } from './SummaryCard';
import { SkeletonCard } from '../ui/SkeletonCard';

interface SummaryCardsProps {
  loading?: boolean;
}

export function SummaryCards({ loading }: SummaryCardsProps) {
  const transactions = useStore((s) => s.transactions);

  const { balance, income, expenses } = useMemo(() => ({
    balance: getTotalBalance(transactions),
    income: getTotalIncome(transactions),
    expenses: getTotalExpenses(transactions),
  }), [transactions]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SummaryCard
        title="Total Balance"
        amount={balance}
        type="balance"
        subtitle="All time net"
      />
      <SummaryCard
        title="Total Income"
        amount={income}
        type="income"
        subtitle="All time earnings"
      />
      <SummaryCard
        title="Total Expenses"
        amount={expenses}
        type="expense"
        subtitle="All time spending"
      />
    </div>
  );
}

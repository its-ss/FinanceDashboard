import { useState, useEffect } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart';
import { SpendingBreakdown } from '../components/dashboard/SpendingBreakdown';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  // Brief skeleton delay to demonstrate loading states
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your financial overview</p>
      </div>

      <SummaryCards loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceTrendChart loading={loading} />
        <SpendingBreakdown loading={loading} />
      </div>
    </div>
  );
}

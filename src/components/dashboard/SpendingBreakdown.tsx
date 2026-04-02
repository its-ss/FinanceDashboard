import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';
import { groupByCategory, formatCurrency } from '../../utils/calculations';
import { SkeletonChart } from '../ui/SkeletonCard';
import { EmptyState } from '../ui/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';

interface SpendingBreakdownProps {
  loading?: boolean;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ background: d.hexColor }} />
        <span className="font-semibold text-gray-700 dark:text-gray-300">{d.category}</span>
      </div>
      <div className="text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(d.total)}</span>
        <span className="ml-1">({d.percentage}%)</span>
      </div>
      <p className="text-xs text-gray-400 mt-1 text-center">Click to filter</p>
    </div>
  );
}

export function SpendingBreakdown({ loading }: SpendingBreakdownProps) {
  const transactions = useStore((s) => s.transactions);
  const navigate = useNavigate();

  const data = useMemo(() => groupByCategory(transactions), [transactions]);

  if (loading) return <SkeletonChart height={280} />;

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Spending Breakdown</h2>
        <EmptyState title="No expenses yet" description="Add expense transactions to see your spending breakdown" icon={<PieIcon className="w-7 h-7 text-gray-400" />} />
      </div>
    );
  }

  const handleClick = (entry: any) => {
    if (entry?.category) {
      navigate(`/transactions?category=${encodeURIComponent(entry.category)}`);
    }
  };

  const topItems = data.slice(0, 6);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 fade-in">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Spending Breakdown</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">Click slice to filter</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">By category (all time)</p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={topItems}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={3}
                onClick={handleClick}
                style={{ cursor: 'pointer' }}
              >
                {topItems.map((entry) => (
                  <Cell key={entry.category} fill={entry.hexColor} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full space-y-2">
          {topItems.map((item) => (
            <button
              key={item.category}
              onClick={() => navigate(`/transactions?category=${encodeURIComponent(item.category)}`)}
              className="w-full flex items-center gap-2 group"
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.hexColor }} />
              <span className="text-xs text-gray-600 dark:text-gray-400 w-24 text-left truncate group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{item.category}</span>
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%`, background: item.hexColor }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-10 text-right">{item.percentage}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

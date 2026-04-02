import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { calculateMonthlyTotals, formatCurrency } from '../../utils/calculations';
import { SkeletonChart } from '../ui/SkeletonCard';
import { EmptyState } from '../ui/EmptyState';
import { TrendingUp } from 'lucide-react';

interface BalanceTrendChartProps {
  loading?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-gray-500 dark:text-gray-400">Income:</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(d?.income ?? 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span className="text-gray-500 dark:text-gray-400">Expenses:</span>
          <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(d?.expenses ?? 0)}</span>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 pt-1 mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          <span className="text-gray-500 dark:text-gray-400">Net:</span>
          <span className={`font-semibold ${d?.net >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(d?.net ?? 0)}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Click to filter transactions</p>
    </div>
  );
}

export function BalanceTrendChart({ loading }: BalanceTrendChartProps) {
  const transactions = useStore((s) => s.transactions);
  const navigate = useNavigate();

  const data = useMemo(() => calculateMonthlyTotals(transactions), [transactions]);

  if (loading) return <SkeletonChart height={280} />;

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Balance Trend</h2>
        <EmptyState title="No data yet" description="Add transactions to see your balance trend" icon={<TrendingUp className="w-7 h-7 text-gray-400" />} />
      </div>
    );
  }

  const handleClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.monthKey) {
      const monthKey = data.activePayload[0].payload.monthKey;
      navigate(`/transactions?month=${monthKey}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 fade-in">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Balance Trend</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">Click a point to filter</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Monthly income vs expenses</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} onClick={handleClick} style={{ cursor: 'pointer' }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
          <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 justify-center">
        {[
          { color: '#10b981', label: 'Income' },
          { color: '#ef4444', label: 'Expenses' },
          { color: '#6366f1', label: 'Net', dashed: true },
        ].map(({ color, label, dashed }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ background: dashed ? 'transparent' : color, borderTop: dashed ? `2px dashed ${color}` : undefined }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

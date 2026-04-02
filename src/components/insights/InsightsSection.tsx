import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useInsights } from '../../hooks/useInsights';
import {
  calculateMonthlyTotals, groupByCategory, formatCurrency,
  getCurrentMonthKey, getPreviousMonthKey, getMonthLabel,
} from '../../utils/calculations';
import { NarrativeInsight } from './NarrativeInsight';
import { BudgetTracker } from './BudgetTracker';
import { EmptyState } from '../ui/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Trophy, Lightbulb } from 'lucide-react';

function ChangeArrow({ value }: { value: number }) {
  if (value > 0) return <TrendingUp className="w-4 h-4 text-red-500 inline-block ml-1" />;
  if (value < 0) return <TrendingDown className="w-4 h-4 text-emerald-500 inline-block ml-1" />;
  return <Minus className="w-4 h-4 text-gray-400 inline-block ml-1" />;
}

export function InsightsSection() {
  const transactions = useStore((s) => s.transactions);
  const insights = useInsights();

  const monthlyTotals = useMemo(() => calculateMonthlyTotals(transactions), [transactions]);
  const categoryTotals = useMemo(() => groupByCategory(transactions), [transactions]);
  const currentMonth = getCurrentMonthKey();
  const prevMonth = getPreviousMonthKey(currentMonth);

  const hasExpenses = transactions.some(t => t.type === 'expense');

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No data yet"
        description="Add transactions to generate insights about your spending"
        icon={<Lightbulb className="w-7 h-7 text-gray-400" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Narrative insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NarrativeInsight
          title="Top Spending Category"
          narrative={insights.topCategoryNarrative}
          meta={hasExpenses ? `Total: ${formatCurrency(insights.topCategoryAmount)}` : undefined}
          accent="indigo"
        />
        <NarrativeInsight
          title="Budget Status"
          narrative={insights.budgetStatusNarrative}
          accent={insights.spendingRisk === 'danger' ? 'red' : insights.spendingRisk === 'warning' ? 'yellow' : 'emerald'}
        />
        <NarrativeInsight
          title="Spending Trend"
          narrative={insights.trendNarrative}
          accent="purple"
        />
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Best Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.bestMonth}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your lowest spending month</p>
        </div>
      </div>

      {/* Month comparison */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 fade-in">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Month-over-Month</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          {getMonthLabel(prevMonth)} vs {getMonthLabel(currentMonth)}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: getMonthLabel(prevMonth), amount: insights.previousMonthExpenses, neutral: true },
            { label: getMonthLabel(currentMonth), amount: insights.currentMonthExpenses, neutral: false },
          ].map(({ label, amount, neutral }) => (
            <div key={label} className={`rounded-lg p-4 ${neutral ? 'bg-gray-50 dark:bg-gray-800' : 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800'}`}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</p>
              <p className="text-xs text-gray-400 mt-0.5">in expenses</p>
            </div>
          ))}
        </div>
        {insights.monthOverMonthChange !== 0 && insights.previousMonthExpenses > 0 && (
          <div className={`mt-3 p-3 rounded-lg text-sm font-medium flex items-center ${
            insights.monthOverMonthChange > 0
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
          }`}>
            <ChangeArrow value={insights.monthOverMonthChange} />
            <span className="ml-2">
              {Math.abs(insights.monthOverMonthChange)}% {insights.monthOverMonthChange > 0 ? 'more' : 'less'} than last month
            </span>
          </div>
        )}
      </div>

      {/* Budget Tracker */}
      <BudgetTracker insights={insights} />

      {/* Category bar chart */}
      {hasExpenses && categoryTotals.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 fade-in">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Spending by Category</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">All time totals</p>
          <ResponsiveContainer width="100%" height={Math.max(200, categoryTotals.length * 40)}>
            <BarChart data={categoryTotals} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={90} />
              <RechartTooltip
                formatter={(value: unknown) => [formatCurrency(value as number), 'Amount']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {categoryTotals.map((entry) => (
                  <Cell key={entry.category} fill={entry.hexColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly trend table */}
      {monthlyTotals.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 fade-in">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Monthly Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Month</th>
                  <th className="pb-2 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Income</th>
                  <th className="pb-2 text-right text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Expenses</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Net</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTotals.map((row) => (
                  <tr key={row.monthKey} className={`border-b border-gray-50 dark:border-gray-800/50 ${row.monthKey === currentMonth ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                    <td className="py-2.5 font-medium text-gray-700 dark:text-gray-300">
                      {row.month}
                      {row.monthKey === currentMonth && <span className="ml-2 text-xs text-indigo-500 font-medium">current</span>}
                    </td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">{formatCurrency(row.income)}</td>
                    <td className="py-2.5 text-right text-red-600 dark:text-red-400 font-medium tabular-nums">{formatCurrency(row.expenses)}</td>
                    <td className={`py-2.5 text-right font-semibold tabular-nums ${row.net >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                      {row.net < 0 ? '-' : ''}{formatCurrency(Math.abs(row.net))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

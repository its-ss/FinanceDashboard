import { useState } from 'react';
import { Settings, Lock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/calculations';
import { ProgressBar } from '../ui/ProgressBar';
import { Tooltip } from '../ui/Tooltip';
import type { InsightData } from '../../types';

interface BudgetTrackerProps {
  insights: InsightData;
}

export function BudgetTracker({ insights }: BudgetTrackerProps) {
  const role = useStore((s) => s.role);
  const budget = useStore((s) => s.budget);
  const setBudget = useStore((s) => s.setBudget);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isAdmin = role === 'admin';
  const hasBudget = budget.monthlyLimit > 0;

  const handleSave = () => {
    const val = Number(inputValue);
    if (val > 0) {
      setBudget(val);
    }
    setEditing(false);
  };

  const handleEdit = () => {
    setInputValue(String(budget.monthlyLimit || ''));
    setEditing(true);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Budget</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {hasBudget ? `Limit: ${formatCurrency(budget.monthlyLimit)}` : 'No budget set'}
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Edit budget"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        ) : (
          <Tooltip content="Only admins can set the budget">
            <button disabled className="p-2 rounded-lg text-gray-300 dark:text-gray-600 cursor-not-allowed">
              <Lock className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {editing && isAdmin && (
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
              placeholder="Monthly limit"
              autoFocus
              className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={handleSave} className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            Save
          </button>
          <button onClick={() => setEditing(false)} className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      )}

      {hasBudget ? (
        <div className="space-y-4">
          <ProgressBar value={insights.budgetUsagePercent} />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Spent</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(insights.currentMonthExpenses)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Budget</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(budget.monthlyLimit)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Remaining</p>
              <p className={`text-sm font-bold ${budget.monthlyLimit - insights.currentMonthExpenses >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(Math.abs(budget.monthlyLimit - insights.currentMonthExpenses))}
                {budget.monthlyLimit - insights.currentMonthExpenses < 0 ? ' over' : ''}
              </p>
            </div>
          </div>

          {insights.projectedMonthlySpend > 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Projected this month: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(insights.projectedMonthlySpend)}</span>
                {insights.projectedMonthlySpend > budget.monthlyLimit && (
                  <span className="ml-1 text-red-500 font-medium">(over budget!)</span>
                )}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">Set a budget to track your monthly spending</p>
          {isAdmin ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Set monthly budget
            </button>
          ) : (
            <p className="text-xs text-gray-400 italic">Contact an admin to set the budget</p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Settings, Lock, ChevronDown, ChevronUp, Pencil, Check, X, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, getCurrentMonthKey } from '../../utils/calculations';
import { ProgressBar } from '../ui/ProgressBar';
import { Tooltip } from '../ui/Tooltip';
import { CATEGORY_CONFIG, EXPENSE_CATEGORIES } from '../../data/mockData';
import { validateBudgetLimit } from '../../utils/validations';
import type { InsightData } from '../../types';

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Housing: '🏠', Entertainment: '🎬',
  Health: '💊', Shopping: '🛍️', Utilities: '💡', Other: '📦',
};

interface BudgetTrackerProps {
  insights: InsightData;
}

export function BudgetTracker({ insights }: BudgetTrackerProps) {
  const role = useStore((s) => s.role);
  const budget = useStore((s) => s.budget);
  const transactions = useStore((s) => s.transactions);
  const setBudget = useStore((s) => s.setBudget);
  const setCategoryLimit = useStore((s) => s.setCategoryLimit);
  const removeCategoryLimit = useStore((s) => s.removeCategoryLimit);
  const addToast = useStore((s) => s.addToast);

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [showCategoryLimits, setShowCategoryLimits] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [catInputValue, setCatInputValue] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  const isAdmin = role === 'admin';
  const hasBudget = budget.monthlyLimit > 0;
  const currentMonth = getCurrentMonthKey();

  // Per-category current month spend
  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
        map[t.category] = (map[t.category] ?? 0) + t.amount;
      }
    }
    return map;
  }, [transactions, currentMonth]);

  const handleSave = () => {
    const err = validateBudgetLimit(inputValue);
    if (err) { setBudgetError(err); return; }
    setBudgetError(null);
    const val = Number(inputValue);
    if (val > 0) {
      setBudget(val);
      addToast(`Monthly budget set to ${formatCurrency(val)}`, 'success');
    }
    setEditing(false);
  };

  const handleEdit = () => {
    setInputValue(String(budget.monthlyLimit || ''));
    setBudgetError(null);
    setEditing(true);
  };

  const handleCategoryEditSave = (category: string) => {
    const err = validateBudgetLimit(catInputValue);
    if (err) { setCatError(err); return; }
    setCatError(null);
    const val = Number(catInputValue);
    if (val > 0) {
      setCategoryLimit(category, val);
      addToast(`${category} budget set to ${formatCurrency(val)}`, 'success');
    } else if (catInputValue === '0' || catInputValue === '') {
      removeCategoryLimit(category);
    }
    setEditingCategory(null);
    setCatInputValue('');
  };

  const handleCategoryEditStart = (category: string) => {
    setCatInputValue(String(budget.categoryLimits?.[category] || ''));
    setCatError(null);
    setEditingCategory(category);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Budget</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {hasBudget ? `Limit: ${formatCurrency(budget.monthlyLimit)}` : 'No budget set'}
          </p>
        </div>
        {isAdmin ? (
          <button onClick={handleEdit} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Edit budget">
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

      {/* Overall budget edit form */}
      {editing && isAdmin && (
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); if (budgetError) setBudgetError(validateBudgetLimit(e.target.value)); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
                placeholder="Monthly limit"
                autoFocus
                className={`w-full pl-7 pr-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all
                  ${budgetError ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : 'border-indigo-300 dark:border-indigo-600 focus:ring-indigo-500'}`}
              />
            </div>
            <button onClick={handleSave} className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Save</button>
            <button onClick={() => setEditing(false)} className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
          {budgetError && (
            <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {budgetError}
            </p>
          )}
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
        <div className="text-center py-4">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">Set a budget to track your monthly spending</p>
          {isAdmin ? (
            <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              Set monthly budget
            </button>
          ) : (
            <p className="text-xs text-gray-400 italic">Contact an admin to set the budget</p>
          )}
        </div>
      )}

      {/* Per-Category Limits section */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setShowCategoryLimits((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            Per-Category Limits
            {insights.overLimitCategories.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full font-semibold">
                {insights.overLimitCategories.length} over limit
              </span>
            )}
          </span>
          {showCategoryLimits
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showCategoryLimits && (
          <div className="mt-3 space-y-2">
            {EXPENSE_CATEGORIES.map((category) => {
              const spent = categorySpend[category] ?? 0;
              const limit = budget.categoryLimits?.[category] ?? 0;
              const usagePercent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
              const isOverLimit = limit > 0 && spent > limit;
              const cfg = CATEGORY_CONFIG[category];
              const icon = CATEGORY_ICONS[category] ?? '📦';
              const isEditingThis = editingCategory === category;

              return (
                <div key={category} className={`rounded-lg p-3 transition-all ${isOverLimit ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm leading-none">{icon}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{category}</span>
                      {isOverLimit && <span className="text-xs text-red-500 font-medium flex-shrink-0">over limit!</span>}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                        {formatCurrency(spent)}{limit > 0 ? ` / ${formatCurrency(limit)}` : ''}
                      </span>

                      {isAdmin ? (
                        isEditingThis ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-1">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                                <input
                                  type="number"
                                  value={catInputValue}
                                  onChange={(e) => { setCatInputValue(e.target.value); if (catError) setCatError(validateBudgetLimit(e.target.value)); }}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleCategoryEditSave(category); if (e.key === 'Escape') { setEditingCategory(null); setCatError(null); } }}
                                  placeholder="0"
                                  autoFocus
                                  className={`w-20 pl-5 pr-2 py-1 text-xs rounded-md border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 transition-all
                                    ${catError ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : 'border-indigo-300 dark:border-indigo-600 focus:ring-indigo-500'}`}
                                />
                              </div>
                              <button onClick={() => handleCategoryEditSave(category)} className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => { setEditingCategory(null); setCatError(null); }} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {catError && (
                              <p className="flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                {catError}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCategoryEditStart(category)}
                            className={`p-1 rounded transition-colors ${limit > 0 ? 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title={limit > 0 ? 'Edit limit' : 'Set limit'}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )
                      ) : (
                        <Tooltip content="Only admins can set category limits">
                          <button disabled className="p-1 rounded text-gray-200 dark:text-gray-700 cursor-not-allowed">
                            <Lock className="w-3 h-3" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  {limit > 0 && (
                    <ProgressBar value={usagePercent} showLabel={false} height="h-1.5" />
                  )}
                  {limit === 0 && spent > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: '30%', background: cfg?.hexColor ?? '#6b7280' }} />
                      </div>
                      <span className="text-xs text-gray-400">no limit</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

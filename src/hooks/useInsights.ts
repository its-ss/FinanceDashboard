import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  calculateMonthlyTotals,
  groupByCategory,
  getCurrentMonthKey,
  getPreviousMonthKey,
  getMonthOverMonthChange,
  getProjectedMonthlySpend,
  formatCurrency,
} from '../utils/calculations';
import type { InsightData } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Housing: '🏠',
  Entertainment: '🎬',
  Health: '💊',
  Shopping: '🛍️',
  Utilities: '💡',
  Other: '📦',
};

export function useInsights(): InsightData {
  const transactions = useStore((s) => s.transactions);
  const budget = useStore((s) => s.budget);

  return useMemo(() => {
    const currentMonth = getCurrentMonthKey();
    const prevMonth = getPreviousMonthKey(currentMonth);

    const monthlyTotals = calculateMonthlyTotals(transactions);
    const categoryTotals = groupByCategory(transactions);

    // Top category
    const topCat = categoryTotals[0];
    const topCategory = topCat?.category ?? 'N/A';
    const topCategoryAmount = topCat?.total ?? 0;
    const topCategoryPercent = topCat?.percentage ?? 0;

    // Top category month-over-month change
    const topCatChange = topCategory !== 'N/A'
      ? getMonthOverMonthChange(transactions, currentMonth, prevMonth, topCategory)
      : null;
    const topCategoryChange = topCatChange?.percentChange ?? 0;

    // Month-over-month overall
    const momChange = getMonthOverMonthChange(transactions, currentMonth, prevMonth);
    const currentMonthExpenses = momChange.current;
    const previousMonthExpenses = momChange.previous;
    const monthOverMonthChange = momChange.percentChange;

    // Budget
    const projectedMonthlySpend = getProjectedMonthlySpend(transactions, currentMonth);
    const budgetUsagePercent =
      budget.monthlyLimit > 0
        ? Math.round((currentMonthExpenses / budget.monthlyLimit) * 100)
        : 0;

    // Risk level
    let spendingRisk: InsightData['spendingRisk'] = 'safe';
    if (budget.monthlyLimit > 0) {
      if (budgetUsagePercent >= 90) spendingRisk = 'danger';
      else if (budgetUsagePercent >= 70) spendingRisk = 'warning';
    } else if (monthOverMonthChange > 20) {
      spendingRisk = 'warning';
    }

    // Best month (lowest expenses)
    const bestMonthData = [...monthlyTotals]
      .filter(m => m.expenses > 0)
      .sort((a, b) => a.expenses - b.expenses)[0];
    const bestMonth = bestMonthData?.month ?? 'N/A';

    // Trend narrative
    const last3Months = monthlyTotals.slice(-3);
    const isRising = last3Months.length >= 2 &&
      last3Months[last3Months.length - 1].expenses > last3Months[0].expenses;
    const hasStableIncome = last3Months.every(m => m.income > 0);

    // Build narratives
    const icon = CATEGORY_ICONS[topCategory] ?? '💸';
    let topCategoryNarrative = `No expense data yet`;
    if (topCategory !== 'N/A') {
      if (topCategoryChange !== 0) {
        const dir = topCategoryChange > 0 ? 'up' : 'down';
        topCategoryNarrative = `${icon} ${topCategory} accounts for ${topCategoryPercent}% of your spending — ${dir} ${Math.abs(topCategoryChange)}% from last month`;
      } else {
        topCategoryNarrative = `${icon} ${topCategory} is your top spending category at ${topCategoryPercent}% of total expenses`;
      }
    }

    let budgetStatusNarrative = `Set a monthly budget to track your spending`;
    if (budget.monthlyLimit > 0) {
      if (spendingRisk === 'danger') {
        budgetStatusNarrative = `⚠️ You've used ${budgetUsagePercent}% of your budget — you're likely to exceed it this month`;
      } else if (spendingRisk === 'warning') {
        budgetStatusNarrative = `⚡ You're on track to hit your budget limit — ${budgetUsagePercent}% used so far`;
      } else {
        budgetStatusNarrative = `✅ You're managing well — only ${budgetUsagePercent}% of your budget used this month`;
      }
    } else if (projectedMonthlySpend > 0) {
      budgetStatusNarrative = `📊 Projected spend this month: ${formatCurrency(projectedMonthlySpend)} — set a budget to track against a goal`;
    }

    let trendNarrative = `Add more transactions to see spending trends`;
    if (last3Months.length >= 2) {
      if (hasStableIncome && isRising) {
        trendNarrative = `📈 Your income is stable, but expenses have been rising over the past months`;
      } else if (!isRising && monthOverMonthChange < 0) {
        trendNarrative = `🎉 Great work! Your spending dropped ${Math.abs(monthOverMonthChange)}% compared to last month`;
      } else if (isRising && monthOverMonthChange > 0) {
        trendNarrative = `📊 This month you spent ${monthOverMonthChange}% more than last month — watch your spending pace`;
      } else {
        trendNarrative = `📊 Your spending has been relatively stable over the past few months`;
      }
    }

    return {
      topCategoryNarrative,
      budgetStatusNarrative,
      trendNarrative,
      bestMonth,
      spendingRisk,
      topCategory,
      topCategoryAmount,
      topCategoryPercent,
      topCategoryChange,
      currentMonthExpenses,
      previousMonthExpenses,
      monthOverMonthChange,
      projectedMonthlySpend,
      budgetUsagePercent,
    };
  }, [transactions, budget]);
}

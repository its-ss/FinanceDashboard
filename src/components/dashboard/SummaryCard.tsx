import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'balance' | 'income' | 'expense';
  subtitle?: string;
  icon?: ReactNode;
}

const CONFIG = {
  balance: {
    bg: 'bg-white dark:bg-gray-900',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    amountColor: 'text-gray-900 dark:text-white',
    Icon: DollarSign,
  },
  income: {
    bg: 'bg-white dark:bg-gray-900',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    amountColor: 'text-emerald-600 dark:text-emerald-400',
    Icon: TrendingUp,
  },
  expense: {
    bg: 'bg-white dark:bg-gray-900',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    amountColor: 'text-red-600 dark:text-red-400',
    Icon: TrendingDown,
  },
};

export function SummaryCard({ title, amount, type, subtitle, icon }: SummaryCardProps) {
  const cfg = CONFIG[type];
  const IconComponent = cfg.Icon;

  return (
    <div className={`
      ${cfg.bg} rounded-xl p-5
      border border-gray-200 dark:border-gray-800
      shadow-sm hover:shadow-md
      transition-all duration-200 hover:-translate-y-0.5
      fade-in
    `}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.iconBg}`}>
          {icon ?? <IconComponent className={`w-4 h-4 ${cfg.iconColor}`} />}
        </div>
      </div>
      <div className={`text-2xl font-bold ${cfg.amountColor} mb-1`}>
        {type === 'balance' && amount < 0 ? '-' : ''}
        {formatCurrency(Math.abs(amount))}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

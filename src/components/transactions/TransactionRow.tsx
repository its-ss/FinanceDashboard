import { Pencil, Trash2, RefreshCw } from 'lucide-react';
import { CATEGORY_CONFIG } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { Tooltip } from '../ui/Tooltip';
import type { Transaction, Role } from '../../types';

interface TransactionRowProps {
  transaction: Transaction;
  role: Role;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Housing: '🏠',
  Entertainment: '🎬',
  Health: '💊',
  Shopping: '🛍️',
  Utilities: '💡',
  Salary: '💼',
  Freelance: '💻',
  Investment: '📈',
  Other: '📦',
};

export function TransactionRow({ transaction: t, role, onEdit, onDelete }: TransactionRowProps) {
  const cfg = CATEGORY_CONFIG[t.category];
  const isAdmin = role === 'admin';
  const icon = CATEGORY_ICONS[t.category] ?? '📦';

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      {/* Date */}
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {formatDate(t.date)}
      </td>

      {/* Description */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none" title={t.category}>{icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">{t.description}</p>
            {t.merchant && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{t.merchant}</p>}
          </div>
          {t.isRecurring && (
            <span title="Recurring"><RefreshCw className="w-3 h-3 text-gray-400 flex-shrink-0" /></span>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.lightBg ?? 'bg-gray-100 dark:bg-gray-800'} ${cfg?.textColor ?? 'text-gray-600'}`}>
          {t.category}
        </span>
      </td>

      {/* Type */}
      <td className="py-3 px-4 hidden md:table-cell">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          t.type === 'income'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {t.type}
        </span>
      </td>

      {/* Amount */}
      <td className="py-3 px-4 text-right">
        <span className={`text-sm font-semibold tabular-nums ${
          t.type === 'income'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAdmin ? (
            <>
              <button
                onClick={() => onEdit(t)}
                className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <Tooltip content="Only admins can edit transactions">
                <button disabled className="p-1.5 rounded-md text-gray-300 dark:text-gray-600 cursor-not-allowed">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <Tooltip content="Only admins can delete transactions">
                <button disabled className="p-1.5 rounded-md text-gray-300 dark:text-gray-600 cursor-not-allowed">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

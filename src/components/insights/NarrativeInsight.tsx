import type { ReactNode } from 'react';

interface NarrativeInsightProps {
  title: string;
  narrative: string;
  meta?: string;
  badge?: string;
  badgeColor?: string;
  icon?: ReactNode;
  accent?: 'indigo' | 'emerald' | 'red' | 'yellow' | 'purple';
}

const ACCENT_STYLES = {
  indigo: 'border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  emerald: 'border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  red: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20',
  yellow: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  purple: 'border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

export function NarrativeInsight({
  title, narrative, meta, badge, badgeColor = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  icon, accent = 'indigo',
}: NarrativeInsightProps) {
  return (
    <div className={`rounded-xl p-4 ${ACCENT_STYLES[accent]} fade-in`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {icon && <span className="text-lg leading-none">{icon}</span>}
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</span>
            {badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{narrative}</p>
          {meta && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{meta}</p>}
        </div>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  height?: string;
}

export function ProgressBar({ value, showLabel = true, height = 'h-3' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const colorClass =
    clamped >= 90 ? 'bg-red-500' :
    clamped >= 70 ? 'bg-yellow-500' :
    'bg-emerald-500';

  const bgClass =
    clamped >= 90 ? 'bg-red-100 dark:bg-red-900/30' :
    clamped >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
    'bg-emerald-100 dark:bg-emerald-900/30';

  return (
    <div>
      <div className={`w-full ${bgClass} rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${colorClass} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">{clamped}% used</span>
          <span className={`text-xs font-medium ${
            clamped >= 90 ? 'text-red-600 dark:text-red-400' :
            clamped >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-emerald-600 dark:text-emerald-400'
          }`}>
            {clamped >= 90 ? 'Over budget!' : clamped >= 70 ? 'Getting close' : 'On track'}
          </span>
        </div>
      )}
    </div>
  );
}

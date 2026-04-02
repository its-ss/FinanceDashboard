import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { ToastItem, ToastVariant } from '../../types';

const VARIANT_CONFIG: Record<ToastVariant, {
  bg: string;
  border: string;
  icon: typeof CheckCircle;
  iconColor: string;
  progressColor: string;
}> = {
  success: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-l-4 border-emerald-500',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    progressColor: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-l-4 border-red-500',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    progressColor: 'bg-red-500',
  },
  warning: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-l-4 border-yellow-500',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    progressColor: 'bg-yellow-500',
  },
  info: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-l-4 border-indigo-500',
    icon: Info,
    iconColor: 'text-indigo-500',
    progressColor: 'bg-indigo-500',
  },
};

const DURATION = 4000; // ms

function ToastBar({ toast }: { toast: ToastItem }) {
  const removeToast = useStore((s) => s.removeToast);
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  const cfg = VARIANT_CONFIG[toast.variant];
  const Icon = cfg.icon;

  // Slide in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown (only for toasts without actions — undo toasts manage their own lifecycle)
  useEffect(() => {
    if (toast.action) return; // undo toasts don't count down in the bar
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [toast.action]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <div className={`
      relative overflow-hidden rounded-xl shadow-lg
      ${cfg.bg} ${cfg.border}
      border border-gray-200 dark:border-gray-700
      min-w-[280px] max-w-sm
      transition-all duration-200
      ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
    `}>
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
        <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
          {toast.message}
        </p>
        <div className="flex items-center gap-2 ml-1 flex-shrink-0">
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                handleDismiss();
              }}
              className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors
                ${toast.variant === 'warning'
                  ? 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                  : 'text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200'
                }`}
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {!toast.action && (
        <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-800">
          <div
            className={`h-full ${cfg.progressColor} transition-all`}
            style={{ width: `${progress}%`, transitionDuration: '50ms' }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 items-end"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastBar key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

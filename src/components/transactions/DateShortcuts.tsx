import { useStore } from '../../store/useStore';

interface Shortcut {
  label: string;
  getRange: () => { from: string; to: string };
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const SHORTCUTS: Shortcut[] = [
  {
    label: 'Today',
    getRange: () => {
      const today = toISO(new Date());
      return { from: today, to: today };
    },
  },
  {
    label: 'This Week',
    getRange: () => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7)); // Monday
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: toISO(monday), to: toISO(sunday) };
    },
  },
  {
    label: 'This Month',
    getRange: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISO(first), to: toISO(now) };
    },
  },
  {
    label: 'Last Month',
    getRange: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toISO(first), to: toISO(last) };
    },
  },
  {
    label: 'Last 3M',
    getRange: () => {
      const now = new Date();
      const from = new Date(now);
      from.setMonth(from.getMonth() - 3);
      return { from: toISO(from), to: toISO(now) };
    },
  },
  {
    label: 'This Year',
    getRange: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), 0, 1);
      return { from: toISO(first), to: toISO(now) };
    },
  },
];

export function DateShortcuts() {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);

  const handleShortcut = (shortcut: Shortcut) => {
    const { from, to } = shortcut.getRange();
    // If already active, clear the range (toggle)
    const range = shortcut.getRange();
    if (filters.dateFrom === range.from && filters.dateTo === range.to) {
      setFilters({ dateFrom: '', dateTo: '' });
      return;
    }
    setFilters({ dateFrom: from, dateTo: to });
  };

  const isActive = (shortcut: Shortcut) => {
    const { from, to } = shortcut.getRange();
    return filters.dateFrom === from && filters.dateTo === to;
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 mr-1">Quick:</span>
      {SHORTCUTS.map((shortcut) => (
        <button
          key={shortcut.label}
          onClick={() => handleShortcut(shortcut)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150
            ${isActive(shortcut)
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          {shortcut.label}
        </button>
      ))}
    </div>
  );
}

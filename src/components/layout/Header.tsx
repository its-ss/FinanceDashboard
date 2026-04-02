import { Moon, Sun, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Role } from '../../types';

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const role = useStore((s) => s.role);
  const darkMode = useStore((s) => s.darkMode);
  const setRole = useStore((s) => s.setRole);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);

  return (
    <header className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <div className="w-4 h-3 flex flex-col justify-between">
            <span className="h-0.5 bg-gray-600 dark:bg-gray-400 rounded" />
            <span className="h-0.5 bg-gray-600 dark:bg-gray-400 rounded" />
            <span className="h-0.5 bg-gray-600 dark:bg-gray-400 rounded" />
          </div>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white hidden sm:block">FinanceFlow</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Role switcher */}
        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-full border font-medium cursor-pointer
              border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800
              text-gray-700 dark:text-gray-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              transition-all"
            aria-label="Switch role"
          >
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Role badge */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          role === 'admin'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        }`}>
          {role === 'admin' ? 'Admin' : 'Viewer'}
        </span>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode
            ? <Sun className="w-4 h-4 text-yellow-500" />
            : <Moon className="w-4 h-4 text-gray-500" />}
        </button>
      </div>
    </header>
  );
}

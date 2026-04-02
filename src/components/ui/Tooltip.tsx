import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
          px-2.5 py-1.5 text-xs font-medium
          bg-gray-900 dark:bg-gray-700 text-white
          rounded-lg shadow-lg
          whitespace-nowrap pointer-events-none
          animate-[fadeIn_0.15s_ease-out]
        ">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
}

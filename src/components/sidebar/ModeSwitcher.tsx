// src/components/sidebar/ModeSwitcher.tsx
import React from 'react';
import { cx } from '@/lib/utils';

interface ModeSwitcherProps {
  activeTab: 'BASE' | 'PRO';
  handleTabChange: (tab: 'BASE' | 'PRO') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ activeTab, handleTabChange }) => {
  return (
    <div className="mb-5 bg-gray-900 border border-gray-800 rounded-lg p-1 flex">
      <button
        onClick={() => handleTabChange('BASE')}
        className={cx(
          "w-1/2 px-3 py-1.5 text-xs rounded-md font-semibold transition-colors",
          activeTab === 'BASE'
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )}
      >
        Стартовая площадка
      </button>
      <button
        onClick={() => handleTabChange('PRO')}
        className={cx(
          "w-1/2 px-3 py-1.5 text-xs rounded-md font-semibold transition-colors",
          activeTab === 'PRO'
            ? "bg-cyan-600 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )}
      >
        Мастерская (PRO)
      </button>
    </div>
  );
};
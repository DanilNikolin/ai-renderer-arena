// src/components/sidebar/ActionButtons.tsx
import React from 'react';
import { cx } from '@/lib/utils';

interface ActionButtonsProps {
  isReadyToGenerate: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onCancel: () => void;
  onClear: () => void;
  error: string | null;
  activeTab: 'BASE' | 'PRO';
  sourceFile: File | null;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isReadyToGenerate,
  isLoading,
  onGenerate,
  onCancel,
  onClear,
  error,
  activeTab,
  sourceFile,
}) => {
  return (
    <div className="mt-5 space-y-3">
      <button
        onClick={onGenerate}
        disabled={!isReadyToGenerate}
        className={cx(
          "w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition",
          isReadyToGenerate
            ? "bg-cyan-600 hover:bg-cyan-500 text-white"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
        )}
        title="Ctrl/Cmd+Enter — тоже сработает"
      >
        {isLoading ? "Обработка..." : (activeTab === 'BASE' ? "Сгенерировать" : "Доработать")}
      </button>

      <div className="flex items-center justify-between">
        {isLoading ? (
          <button
            onClick={onCancel}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Отменить (Esc)
          </button>
        ) : (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            Очистить
          </button>
        )}
        {sourceFile && (
          <span className="text-[11px] text-gray-500">
            {sourceFile.type.replace("image/", "").toUpperCase()}
          </span>
        )}
      </div>

      {error && (
        <div className="text-red-300 text-xs bg-red-900/20 border border-red-800/40 rounded p-2">
          <p className="font-semibold">Ошибка</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
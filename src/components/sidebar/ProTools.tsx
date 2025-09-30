// src/components/sidebar/ProTools.tsx
import React from 'react';
import { GenerationNode } from '@/lib/types';

interface ProToolsProps {
  activeHistory: GenerationNode[];
  handleChangeSource: () => void;
}

export const ProTools: React.FC<ProToolsProps> = ({ activeHistory, handleChangeSource }) => {
  return (
    <div className="space-y-3">
      {activeHistory.length > 0 && (
        <div className="mb-2">
          <button
            onClick={handleChangeSource}
            className="w-full text-center text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-800/50 bg-yellow-900/20 rounded-md py-2 transition"
          >
            ↩︎ Сменить исходник
          </button>
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-200">PRO-инструменты</h3>
      {/* ЗАГЛУШКИ */}
      <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-400">Замена Текстуры</div>
      <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-400">Замена Стиля</div>
      <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-400">Замена Фона</div>
      <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-400">Внедрение Объекта</div>
      <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-400">Редактор по Стрелкам</div>
    </div>
  );
};
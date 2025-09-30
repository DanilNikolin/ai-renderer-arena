// src/components/sidebar/ProTools.tsx
import React, { useState } from 'react';
import { cx } from '@/lib/utils';
import type { SidebarProps } from '../workspace/Sidebar.types';
import { InstructionEditor } from './InstructionEditor';

// ProTools теперь стал диспетчером, поэтому ему нужны почти все те же пропсы,
// что и новому InstructionEditor, чтобы передать их дальше.
type ProToolsProps = Omit<SidebarProps, 'handleTabChange'>;

export const ProTools: React.FC<ProToolsProps> = (props) => {
  // Локальный стейт для управления видимостью нашего редактора
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  return (
    <div className="space-y-3">
      {/* Кнопка "Сменить исходник" остается над инструментами */}
      {props.activeHistory.length > 0 && (
        <div className="mb-2">
          <button
            onClick={props.handleChangeSource}
            className="w-full text-center text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-800/50 bg-yellow-900/20 rounded-md py-2 transition"
          >
            ↩︎ Сменить исходник
          </button>
        </div>
      )}
      
      <h3 className="text-sm font-semibold text-gray-200">PRO-инструменты</h3>

      {/* --- Наш новый баян --- */}
      <div className="space-y-2">
        {/* Блок 1: Правка по инструкции (наш новый компонент) */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsEditorOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 p-3"
          >
            {isEditorOpen ? '▼' : '►'} Правка по инструкции
          </button>
          {isEditorOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <InstructionEditor {...props} />
            </div>
          )}
        </div>

        {/* Остальные инструменты пока остаются заглушками */}
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Замена Текстуры</div>
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Замена Стиля</div>
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Замена Фона</div>
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Внедрение Объекта</div>
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Редактор по Стрелкам</div>
      </div>
    </div>
  );
};
// src/components/sidebar/ProTools.tsx
import React, { useState } from 'react';
import { cx } from '@/lib/utils';
import type { SidebarProps } from '../workspace/Sidebar.types';
import { InstructionEditor } from './InstructionEditor';
import { BackgroundReplacer } from './BackgroundReplacer'; // <<< 1. Импортируем новый инструмент

// ProTools теперь должен знать о новой функции, которую он будет передавать
type ProToolsProps = Omit<SidebarProps, 'handleTabChange'> & {
  onGenerateBackgroundReplacement: (file: File, targets: { window: boolean; door: boolean }) => void;
};

export const ProTools: React.FC<ProToolsProps> = (props) => {
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  // <<< 2. Добавляем стейт для нового "баяна"
  const [isBgReplacerOpen, setIsBgReplacerOpen] = useState(false);

  return (
    <div className="space-y-3">
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

      <div className="space-y-2">
        {/* Блок 1: Правка по инструкции (без изменений) */}
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

        {/* <<< 3. НАЧАЛО: Наш новый блок "Замена Фона" */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsBgReplacerOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 p-3"
          >
            {isBgReplacerOpen ? '▼' : '►'} Замена Фона
          </button>
          {isBgReplacerOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <BackgroundReplacer
                onGenerate={props.onGenerateBackgroundReplacement}
                isLoading={props.isLoading}
              />
            </div>
          )}
        </div>
        {/* <<< КОНЕЦ НОВОГО БЛОКА */}


        {/* Остальные инструменты пока остаются заглушками */}
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Замена Текстуры</div>
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Замена Стиля</div>
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Внедрение Объекта</div>
        <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-xs text-gray-500 cursor-not-allowed">► Редактор по Стрелкам</div>
      </div>
    </div>
  );
};
// src/components/sidebar/ProTools.tsx
import React, { useState, useEffect } from 'react';
import type { SidebarProps } from '../workspace/Sidebar.types';

import { InstructionEditor } from './InstructionEditor';
import { TextureTransplanter } from './TextureTransplanter';
import { BackgroundReplacer } from './BackgroundReplacer';
import { StyleTransplanter } from './StyleTransplanter';
import { ObjectInjector } from './ObjectInjector';
import { ObjectInjector3D } from './ObjectInjector3D'; // <<< 1. ИМПОРТИРУЕМ НОВЫЙ КОМПОНЕНТ

import { MultiArrowEditor } from '../editor/MultiArrowEditor';
import { Label } from '../ui/FormControls';
import { cx } from '@/lib/utils';
import Image from 'next/image';

type ProToolsProps = Omit<SidebarProps, 'handleTabChange' | 'onGenerateBackgroundReplacement' | 'onGenerateStyleReplacement'> & {
  onGenerateBackgroundReplacement: (
    file: File | null, 
    targets: { window: boolean; door: boolean },
    model: 'gemini' | 'seedream'
  ) => void;
  onGenerateTextureReplacement: (
    targetMapFile: File,
    textureFile: File,
    model: 'gemini' | 'seedream'
  ) => void;
  onGenerateStyleReplacement: (
    file: File | null,
    model: 'gemini' | 'seedream'
  ) => void;
  onGenerateObjectInjection: (
    targetMapFile: File,
    objectFile: File,
    model: 'gemini' | 'seedream'
  ) => void;
  onGenerateArrowEdits: (
    imageBlob: Blob,
    instructionsText: string,
    model: 'gemini' | 'seedream'
  ) => void;
  sourceAspectRatio: number;
};

export const ProTools: React.FC<ProToolsProps> = (props) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBgReplacerOpen, setIsBgReplacerOpen] = useState(false);
  const [isTextureTransplanterOpen, setIsTextureTransplanterOpen] = useState(false);
  const [isStyleTransplanterOpen, setIsStyleTransplanterOpen] = useState(false);
  const [isObjectInjectorOpen, setIsObjectInjectorOpen] = useState(false);
  const [isArrowSectionOpen, setIsArrowSectionOpen] = useState(false); // <<< новый стейт секции
  const [isObjectInjector3DOpen, setIsObjectInjector3DOpen] = useState(false); // <<< 2. ДОБАВЛЯЕМ СТЕЙТ ДЛЯ НОВОЙ ВКЛАДКИ

  const [isArrowEditorOpen, setIsArrowEditorOpen] = useState(false);
  const [arrowEditorModel, setArrowEditorModel] = useState<'gemini' | 'seedream'>('seedream');

  // предпросмотр карты стрелок
  const [arrowMapBlob, setArrowMapBlob] = useState<Blob | null>(null);
  const [arrowMapPreviewUrl, setArrowMapPreviewUrl] = useState<string | null>(null);
  const [arrowInstructions, setArrowInstructions] = useState<string>('');

  const handleResetArrowEditor = () => {
    setArrowMapBlob(null);
    setArrowInstructions('');
    if (arrowMapPreviewUrl) {
      URL.revokeObjectURL(arrowMapPreviewUrl);
      setArrowMapPreviewUrl(null);
    }
  };

  // сброс при смене активного узла
  useEffect(() => {
    setArrowMapBlob(null);
    if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
    setArrowMapPreviewUrl(null);
    setArrowInstructions('');
  }, [props.activeNode?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // очистка URL при размонтировании/смене превью
  useEffect(() => {
    return () => {
      if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
    };
  }, [arrowMapPreviewUrl]);

  // получаем из редактора blob + текст
  const handleArrowEditorConfirm = (imageBlob: Blob, instructionsText: string) => {
    setArrowMapBlob(imageBlob);
    setArrowInstructions(instructionsText);
    if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
    setArrowMapPreviewUrl(URL.createObjectURL(imageBlob));
    setIsArrowEditorOpen(false);
  };

  // отправка в API
  const handleSendArrowEdits = () => {
    if (!arrowMapBlob || !arrowInstructions.trim()) {
      console.error('--- [ProTools] ОСТАНОВКА: Нет картинки (blob) или текста инструкций!');
      return;
    }
    props.onGenerateArrowEdits(arrowMapBlob, arrowInstructions, arrowEditorModel);
  };

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
        {/* Правка по инструкции */}
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

        {/* Замена Фона */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsBgReplacerOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed p-3"
            disabled={!props.activeNode}
          >
            {isBgReplacerOpen ? '▼' : '►'} Замена Фона
          </button>
          {isBgReplacerOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <BackgroundReplacer
                onGenerate={props.onGenerateBackgroundReplacement}
                isLoading={props.isLoading}
                sourceAspectRatio={props.sourceAspectRatio}
                helperPrompt={props.helperPrompts.background}
                onHelperPromptChange={(val) => props.setHelperPrompts(p => ({ ...p, background: val }))}
              />
            </div>
          )}
        </div>

        {/* Замена Текстуры */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
              type="button"
              onClick={() => setIsTextureTransplanterOpen((v) => !v)}
              className="w-full text-left text-sm font-medium text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed p-3"
              disabled={!props.activeNode}
            >
            {isTextureTransplanterOpen ? '▼' : '►'} Замена Текстуры
          </button>
          {isTextureTransplanterOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <TextureTransplanter
                onGenerate={props.onGenerateTextureReplacement}
                isLoading={props.isLoading}
                activeImageUrl={props.activeNode?.imageUrl ?? null}
                sourceAspectRatio={props.sourceAspectRatio}
                helperPrompt={props.helperPrompts.texture}
                onHelperPromptChange={(val) => props.setHelperPrompts(p => ({ ...p, texture: val }))}
              />
            </div>
          )}
        </div>

        {/* Замена Стиля */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
              type="button"
              onClick={() => setIsStyleTransplanterOpen((v) => !v)}
              className="w-full text-left text-sm font-medium text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed p-3"
              disabled={!props.activeNode}
            >
            {isStyleTransplanterOpen ? '▼' : '►'} Замена Стиля
          </button>
          {isStyleTransplanterOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <StyleTransplanter
                onGenerate={props.onGenerateStyleReplacement}
                isLoading={props.isLoading}
                sourceAspectRatio={props.sourceAspectRatio}
                helperPrompt={props.helperPrompts.style}
                onHelperPromptChange={(val) => props.setHelperPrompts(p => ({ ...p, style: val }))}
              />
            </div>
          )}
        </div>

        {/* Внедрение Объекта (2D) */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsObjectInjectorOpen((v) => !v)}
            className="w-full text-left text-sm font-medium text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed p-3"
            disabled={!props.activeNode}
          >
            {isObjectInjectorOpen ? '▼' : '►'} Внедрение Объекта (2D)
          </button>
          {isObjectInjectorOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <ObjectInjector
                onGenerate={props.onGenerateObjectInjection}
                isLoading={props.isLoading}
                activeImageUrl={props.activeNode?.imageUrl ?? null}
                sourceAspectRatio={props.sourceAspectRatio}
                helperPrompt={props.helperPrompts.object}
                onHelperPromptChange={(val) => props.setHelperPrompts(p => ({ ...p, object: val }))}
              />
            </div>
          )}
        </div>

        {/* <<< 3. НОВАЯ СЕКЦИЯ-АККОРДЕОН ДЛЯ 3D */}
        <div className="bg-gray-900/50 border border-purple-800/50 rounded-lg">
          <button
            type="button"
            onClick={() => setIsObjectInjector3DOpen((v) => !v)} // <<< ПОЧИНЕНО
            className="w-full text-left text-sm font-medium text-purple-400 disabled:text-gray-600 disabled:cursor-not-allowed p-3" // <<< ЦВЕТ ТОЖЕ
            disabled={!props.activeNode}
          >
            {isObjectInjector3DOpen ? '▼' : '►'} Интеграция Объекта (3D)
          </button>
          {isObjectInjector3DOpen && (
            <div className="p-3 border-t border-purple-800/50">
            <ObjectInjector3D
              saunaImageUrl={props.activeNode?.imageUrl ?? null}
              onGenerate={props.onGenerateObjectInjection3D}
            />
          </div>
          )}
        </div>

        {/* Редактор по Стрелкам — сворачиваемая секция */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button
              type="button"
              onClick={() => setIsArrowSectionOpen((v) => !v)}
              className="w-full text-left text-sm font-medium text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed p-3"
              disabled={!props.activeNode}
            >
            {isArrowSectionOpen ? '▼' : '►'} Редактор по Стрелкам
          </button>

          {isArrowSectionOpen && (
            <div className="p-3 border-t border-gray-700/50 space-y-3">
              <p className="text-xs text-gray-400 -mt-2 mb-2">
                Точечные правки с помощью текстовых инструкций.
              </p>

              {/* === ПОСЛЕ РЕДАКТОРА (когда есть превью) — здесь тоже выбор модели === */}
              {arrowMapPreviewUrl ? (
                <div className="space-y-3">
                  <Label title="Модель" />
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
                    {(['gemini', 'seedream'] as const).map((model) => (
                      <button
                        key={model}
                        onClick={() => setArrowEditorModel(model)}
                        type="button"
                        className={cx(
                          'py-1.5 rounded-md text-xs font-semibold transition-colors',
                          arrowEditorModel === model
                            ? 'bg-cyan-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800'
                        )}
                      >
                        {model === 'gemini' ? 'Nano Banana' : 'SeeDream'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <Label title="Карта инструкций (превью)" />
                    <div className="relative h-24 w-full rounded-lg border border-cyan-700 bg-gray-950 overflow-hidden">
                      <Image
                        src={arrowMapPreviewUrl}
                        alt="Arrow map preview"
                        fill
                        sizes="150px"
                        className="object-contain"
                      />
                      <button 
                        onClick={handleResetArrowEditor}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition"
                        title="Изменить/Убрать карту"
                      >✕</button>
                    </div>
                  </div>

                  <button
                    onClick={handleSendArrowEdits}
                    className="w-full text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md py-2.5"
                    type="button"
                  >
                    Применить правки
                  </button>
                </div>
              ) : (
                // === ДО РЕДАКТОРА — выбор модели + кнопка открытия редактора ===
                <div className="space-y-3">
                  <Label title="Модель" />
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
                    {(['gemini', 'seedream'] as const).map((model) => (
                      <button
                        key={model}
                        onClick={() => setArrowEditorModel(model)}
                        type="button"
                        className={cx(
                          'py-1.5 rounded-md text-xs font-semibold transition-colors',
                          arrowEditorModel === model
                            ? 'bg-cyan-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800'
                        )}
                      >
                        {model === 'gemini' ? 'Nano Banana' : 'SeeDream'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsArrowEditorOpen(true)}
                    disabled={!props.activeNode}
                    className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-cyan-800 hover:bg-cyan-700 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    ✍️ Открыть редактор
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Портал стрелочного редактора */}
      {isArrowEditorOpen && props.activeNode && (
        <MultiArrowEditor
          imageSrc={props.activeNode.imageUrl}
          onCancel={() => setIsArrowEditorOpen(false)}
          onConfirm={handleArrowEditorConfirm}
        />
      )}
    </div>
  );
};

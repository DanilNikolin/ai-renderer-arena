// src/components/sidebar/TextureTransplanter.tsx
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { cx } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/types';
import { Label } from '../ui/FormControls';
import { ArrowPointer } from '../editor/ArrowPointer';
import { UniversalCropper } from '../cropper/UniversalCropper'; // <<< 1. ИМПОРТ КРОППЕРА
import Image from 'next/image';

interface TextureTransplanterProps {
  onGenerate: (targetMapFile: File, textureFile: File, model: 'gemini' | 'seedream') => void;
  isLoading: boolean;
  activeImageUrl: string | null;
  sourceAspectRatio: number;
  hideModelSelector?: boolean;
  helperPrompt: string;
  onHelperPromptChange: (value: string) => void;
}

export const TextureTransplanter: React.FC<TextureTransplanterProps> = ({
  onGenerate,
  isLoading,
  activeImageUrl,
  sourceAspectRatio, // <<< 2. ПОЛУЧАЕМ ПРОПС
  hideModelSelector = false,
  helperPrompt,
  onHelperPromptChange,
}) => {
  // Этот стейт теперь хранит ГОТОВЫЙ, ОБРЕЗАННЫЙ файл
  const [textureFile, setTextureFile] = useState<File | null>(null);
  const [texturePreview, setTexturePreview] = useState<string | null>(null);
  const [targetMapFile, setTargetMapFile] = useState<File | null>(null);
  const [targetMapPreview, setTargetMapPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPointerEditorOpen, setIsPointerEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // <<< 3. НОВЫЙ СТЕЙТ ДЛЯ УПРАВЛЕНИЯ КРОППЕРОМ
  const [cropRequest, setCropRequest] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'seedream'>('gemini');

  const isReady = textureFile && targetMapFile && !isLoading;

  useEffect(() => {
    setTextureFile(null);
    setTargetMapFile(null);
  }, [activeImageUrl]);

  useEffect(() => {
    if (!textureFile) {
      setTexturePreview(null);
      return;
    }
    const url = URL.createObjectURL(textureFile);
    setTexturePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [textureFile]);

  useEffect(() => {
    if (!targetMapFile) {
      setTargetMapPreview(null);
      return;
    }
    const url = URL.createObjectURL(targetMapFile);
    setTargetMapPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [targetMapFile]);
  
  // <<< 4. ОБНОВЛЕННАЯ ЛОГИКА ЗАГРУЗКИ: ТЕПЕРЬ ОНА ОТКРЫВАЕТ КРОППЕР
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Неверный тип файла. Нужен PNG, JPEG или WebP.');
      return;
    }
    setError(null);
    
    // Создаем временный URL и отправляем его в стейт, чтобы открыть модалку кроппера
    const url = URL.createObjectURL(file);
    setCropRequest(url);
  };

  // <<< 5. НОВЫЕ ОБРАБОТЧИКИ ДЛЯ РЕЗУЛЬТАТОВ КРОППЕРА
  const handleCropConfirm = (croppedBlob: Blob) => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);

    const croppedFile = new File([croppedBlob], "texture_crop.png", { type: "image/png" });
    setTextureFile(croppedFile);
  };

  const handleCropCancel = () => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);
  };
  
  const handlePointerConfirm = (blob: Blob) => {
    const file = new File([blob], 'target_map.png', { type: 'image/png' });
    setTargetMapFile(file);
    setIsPointerEditorOpen(false);
  };

  const handleSubmit = () => {
    if (!isReady || !targetMapFile || !textureFile) return;
    onGenerate(targetMapFile, textureFile, selectedModel);
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок 1: Загрузка Текстуры */}
        <div>
          <Label title="1. Загрузите текстуру" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ACCEPTED_FILE_TYPES.join(',')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            {texturePreview ? 'Заменить текстуру' : '+ Выбрать текстуру'}
          </button>
          {texturePreview && (
            <div className="mt-3 relative h-20 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
              <Image src={texturePreview} alt="Texture preview" fill sizes="120px" className="object-cover" />
              <button 
                onClick={() => setTextureFile(null)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition"
                title="Убрать текстуру"
              >✕</button>
            </div>
          )}
        </div>

        {/* Блок 2: Указание Цели */}
        <div>
          <Label title="2. Укажите цель на фото" />
          <button
            type="button"
            onClick={() => setIsPointerEditorOpen(true)}
            disabled={!activeImageUrl}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {targetMapPreview ? 'Изменить указатель' : '🎯 Поставить указатель'}
          </button>
           {targetMapPreview && (
            <div className="mt-3 relative h-20 w-full rounded-lg border border-cyan-700 bg-gray-950 overflow-hidden">
              <Image src={targetMapPreview} alt="Target map preview" fill sizes="120px" className="object-contain" />
              <button 
                onClick={() => setTargetMapFile(null)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition"
                title="Убрать указатель"
              >✕</button>
            </div>
          )}
        </div>
        
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        {!hideModelSelector && (
            <div>
              <Label title="Модель" />
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
                {(['gemini', 'seedream'] as const).map(model => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={cx(
                      "py-1.5 rounded-md text-xs font-semibold transition-colors",
                      selectedModel === model
                        ? 'bg-cyan-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800'
                    )}
                  >
                    {model === 'gemini' ? 'Nano Banana' : 'SeeDream'}
                  </button>
                ))}
              </div>
            </div>
          )}
        
         <div>
             <Label title="Уточнение (необязательно)" />
            <div className="relative">
                <textarea
                    rows={2}
                    maxLength={180}
                    value={helperPrompt}
                    onChange={(e) => onHelperPromptChange(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 pr-12 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Пример: сделать текстуру более старой"
                />
                <span className="absolute bottom-2 right-2 text-[10px] text-gray-500">
                    {helperPrompt.length}/180
                </span>
            </div>
        </div>

        {/* Кнопка действия */}
        <button
          onClick={handleSubmit}
          disabled={!isReady}
          className={cx(
            "w-full text-sm font-semibold py-2.5 rounded-lg transition",
            isReady
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? "Обработка..." : "Применить Текстуру"}
        </button>
      </div>

      {isPointerEditorOpen && activeImageUrl && (
        <ArrowPointer
          imageSrc={activeImageUrl}
          onConfirm={handlePointerConfirm}
          onCancel={() => setIsPointerEditorOpen(false)}
        />
      )}

      {/* <<< 6. ДОБАВЛЕН УСЛОВНЫЙ РЕНДЕР КРОППЕРА */}
      {cropRequest && (
        <UniversalCropper
          imageSrc={cropRequest}
          aspectRatio={sourceAspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};
// src/components/sidebar/TextureTransplanter.tsx

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  ChangeEvent,
} from 'react';
import { cx } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/types';
import { Label } from '../ui/FormControls';
import { ArrowPointer } from '../editor/ArrowPointer';
import { UniversalCropper } from '../cropper/UniversalCropper';
import Image from 'next/image';

interface TextureTransplanterProps {
  onGenerate: (
    targetMapFile: File,
    textureFile: File,
    model: 'gemini' | 'seedream'
  ) => void;
  isLoading: boolean;
  activeImageUrl: string | null;
  /** Соотношение сторон исходного изображения — кроппер будет его соблюдать */
  sourceAspectRatio: number;
  /** Скрыть выбор модели (если нужно) */
  hideModelSelector?: boolean;
  /** Доп. уточнение для модели */
  helperPrompt: string;
  onHelperPromptChange: (value: string) => void;
}

/** Тип ассета из библиотеки (API) */
type LibraryAsset = {
  id: string;
  name: string;
  type: '2d_object' | '3d_object';
  fileUrl: string;
  thumbnailUrl: string | null;
};

export const TextureTransplanter: React.FC<TextureTransplanterProps> = ({
  onGenerate,
  isLoading,
  activeImageUrl,
  sourceAspectRatio,
  hideModelSelector = false,
  helperPrompt,
  onHelperPromptChange,
}) => {
  /**
   * Файл текстуры: уже обрезанный кроппером
   */
  const [textureFile, setTextureFile] = useState<File | null>(null);
  const [texturePreview, setTexturePreview] = useState<string | null>(null);

  /**
   * Файл target map (карту целей рисуем через ArrowPointer)
   */
  const [targetMapFile, setTargetMapFile] = useState<File | null>(null);
  const [targetMapPreview, setTargetMapPreview] = useState<string | null>(null);

  /**
   * Ошибки UX
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Модалка указателя
   */
  const [isPointerEditorOpen, setIsPointerEditorOpen] = useState(false);

  /**
   * File input для загрузки своей текстуры
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Управление кроппером: если cropRequest установлен, рендерим UniversalCropper
   * В cropRequest кладём объектный URL исходной загруженной/выбранной из библиотеки картинки
   */
  const [cropRequest, setCropRequest] = useState<string | null>(null);

  /**
   * Выбор модели
   */
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'seedream'>(
    'gemini'
  );

  /**
   * Режим источника текстуры: загрузка своей или выбор из библиотеки
   */
  const [mode, setMode] = useState<'upload' | 'library'>('upload');

  /**
   * Состояние библиотеки 2D-ассетов
   */
  const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  /**
   * Готовность к запуску
   */
  const isReady = Boolean(textureFile && targetMapFile && !isLoading);

  /**
   * Если сменили активное изображение (фон), сбрасываем выбранные файлы
   */
  useEffect(() => {
    setTextureFile(null);
    setTargetMapFile(null);
    setTexturePreview(null);
    setTargetMapPreview(null);
    setError(null);
    setCropRequest(null);
  }, [activeImageUrl]);

  /**
   * Превью текстуры
   */
  useEffect(() => {
    if (!textureFile) {
      setTexturePreview(null);
      return;
    }
    const url = URL.createObjectURL(textureFile);
    setTexturePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [textureFile]);

  /**
   * Превью target map
   */
  useEffect(() => {
    if (!targetMapFile) {
      setTargetMapPreview(null);
      return;
    }
    const url = URL.createObjectURL(targetMapFile);
    setTargetMapPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [targetMapFile]);

  /**
   * Подгрузка библиотеки ассетов (2D) при переходе в режим "library".
   * useLayoutEffect, чтобы избежать визуального "мигания" при первом отображении таба.
   */
  useLayoutEffect(() => {
    let aborted = false;

    const load = async () => {
      if (mode !== 'library') return;
      if (libraryAssets.length > 0) return;

      setIsLoadingLibrary(true);
      setError(null);

      try {
        const res = await fetch('/api/library/assets?type=2d_texture');
        if (!res.ok) throw new Error('Failed to load library');

        const data: LibraryAsset[] = await res.json();
        if (!aborted) {
          setLibraryAssets(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!aborted) {
          setError(
            e instanceof Error ? e.message : 'Library load error'
          );
        }
      } finally {
        if (!aborted) {
          setIsLoadingLibrary(false);
        }
      }
    };

    load();

    return () => {
      aborted = true;
    };
    // намеренно зависим только от mode и длины массива — повторная загрузка не нужна
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, libraryAssets.length]);

  /**
   * Обработчик выбора ассета из библиотеки.
   * Качаем файл ассета → в blob → создаём objectURL → отправляем в кроппер.
   */
  const handleLibrarySelect = async (asset: LibraryAsset) => {
    setError(null);
    try {
      const res = await fetch(asset.fileUrl);
      if (!res.ok) throw new Error('Failed to download asset');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setCropRequest(url); // откроет кроппер
      setMode('upload'); // возвращаемся на вкладку "Загрузить свою", чтобы UI был консистентным
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error selecting asset');
    }
  };

  /**
   * Загрузка своей текстуры → вместо прямой установки файла отправляем в кроппер
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Need PNG, JPEG or WebP.');
      return;
    }
    setError(null);

    const url = URL.createObjectURL(file);
    setCropRequest(url); // откроет UniversalCropper
  };

  /**
   * Результаты кроппера
   */
  const handleCropConfirm = (croppedBlob: Blob) => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);

    const croppedFile = new File([croppedBlob], 'texture_crop.png', {
      type: 'image/png',
    });
    setTextureFile(croppedFile);
  };

  const handleCropCancel = () => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);
  };

  /**
   * Результат редактора указателя (ArrowPointer)
   */
  const handlePointerConfirm = (blob: Blob) => {
    const file = new File([blob], 'target_map.png', { type: 'image/png' });
    setTargetMapFile(file);
    setIsPointerEditorOpen(false);
  };

  /**
   * Запуск генерации
    */
  const handleSubmit = () => {
    if (!isReady || !targetMapFile || !textureFile) return;
    onGenerate(targetMapFile, textureFile, selectedModel);
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок 1: Загрузка Текстуры */}
        <div>
          <Label title="1. Upload Texture" />

          {/* Табы: Загрузить свою / Библиотека */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-900 border border-gray-700 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={cx(
                'py-1 rounded-md text-xs font-semibold transition-colors',
                mode === 'upload'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              )}
            >
              Upload Own
            </button>
            <button
              type="button"
              onClick={() => setMode('library')}
              className={cx(
                'py-1 rounded-md text-xs font-semibold transition-colors',
                mode === 'library'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              )}
            >
              Library
            </button>
          </div>

          {/* Режим: Загрузить свою */}
          {mode === 'upload' && (
            <div className="space-y-3">
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
                {texturePreview ? 'Replace Texture' : '+ Select Texture'}
              </button>

              {texturePreview && (
                <div className="mt-3 relative h-20 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                  <Image
                    src={texturePreview}
                    alt="Texture preview"
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setTextureFile(null)}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition"
                    title="Remove Texture"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Режим: Библиотека */}
          {mode === 'library' && (
            <div className="p-2 bg-gray-900 border border-gray-700 rounded-lg">
              {isLoadingLibrary && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Loading...
                </p>
              )}

              {!isLoadingLibrary && libraryAssets.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                  2D Texture Library is empty.
                </p>
              )}

              <div className="grid grid-cols-4 gap-2 max-h-[150px] overflow-y-auto">
                {libraryAssets.map((asset) => (
                  <button
                    type="button"
                    key={asset.id}
                    title={asset.name}
                    onClick={() => handleLibrarySelect(asset)}
                    className="aspect-square relative rounded-md bg-gray-800 overflow-hidden border border-gray-600 hover:border-cyan-500"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.thumbnailUrl ?? asset.fileUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 text-[9px] bg-black/60 text-white truncate px-1 py-0.5">
                      {asset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Блок 2: Указание цели на фото */}
        <div>
          <Label title="2. Indicate Target on Photo" />
          <button
            type="button"
            onClick={() => setIsPointerEditorOpen(true)}
            disabled={!activeImageUrl}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {targetMapPreview ? 'Change Pointer' : '🎯 Place Pointer'}
          </button>

          {targetMapPreview && (
            <div className="mt-3 relative h-20 w-full rounded-lg border border-cyan-700 bg-gray-950 overflow-hidden">
              <Image
                src={targetMapPreview}
                alt="Target map preview"
                fill
                sizes="120px"
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => setTargetMapFile(null)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition"
                title="Remove Pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Ошибки */}
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

        {/* Выбор модели */}
        {!hideModelSelector && (
          <div>
            <Label title="Model" />
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
              {(['gemini', 'seedream'] as const).map((model) => (
                <button
                  type="button"
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={cx(
                    'py-1.5 rounded-md text-xs font-semibold transition-colors',
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

        {/* Доп. уточнение */}
        <div>
          <Label title="Clarification (optional)" />
          <div className="relative">
            <textarea
              rows={2}
              maxLength={180}
              value={helperPrompt}
              onChange={(e) => onHelperPromptChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 pr-12 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Example: make texture older"
            />
            <span className="absolute bottom-2 right-2 text-[10px] text-gray-500">
              {helperPrompt.length}/180
            </span>
          </div>
        </div>

        {/* Кнопка действия */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady}
          className={cx(
            'w-full text-sm font-semibold py-2.5 rounded-lg transition',
            isReady
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          )}
        >
          {isLoading ? 'Processing...' : 'Apply Texture'}
        </button>
      </div>

      {/* Редактор указателя */}
      {isPointerEditorOpen && activeImageUrl && (
        <ArrowPointer
          imageSrc={activeImageUrl}
          onConfirm={handlePointerConfirm}
          onCancel={() => setIsPointerEditorOpen(false)}
        />
      )}

      {/* Модалка кроппера */}
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

// src/components/sidebar/ObjectInjector.tsx
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

interface ObjectInjectorProps {
  onGenerate: (targetMapFile: File, objectFile: File, model: 'gemini' | 'seedream') => void;
  isLoading: boolean;
  activeImageUrl: string | null;
  hideModelSelector?: boolean;
  sourceAspectRatio: number;
  helperPrompt: string;
  onHelperPromptChange: (value: string) => void;
}

/**
 * Тип ассета из библиотеки (API / MinIO)
 */
type LibraryAsset = {
  id: string;
  name: string;
  type: '2d_object' | '3d_object';
  fileUrl: string;
  thumbnailUrl: string | null;
};

export const ObjectInjector: React.FC<ObjectInjectorProps> = ({
  onGenerate,
  isLoading,
  activeImageUrl,
  hideModelSelector = false,
  sourceAspectRatio,
  helperPrompt,
  onHelperPromptChange,
}) => {
  // --- файлы и превью ---
  const [objectFile, setObjectFile] = useState<File | null>(null);
  const [objectPreview, setObjectPreview] = useState<string | null>(null);
  const [targetMapFile, setTargetMapFile] = useState<File | null>(null);
  const [targetMapPreview, setTargetMapPreview] = useState<string | null>(null);

  // --- ошибки/сервисные стейты ---
  const [error, setError] = useState<string | null>(null);
  const [isPointerEditorOpen, setIsPointerEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- кроппер и модель ---
  const [cropRequest, setCropRequest] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'seedream'>('gemini');

  // --- новый функционал: режим вкладок и библиотека ---
  const [mode, setMode] = useState<'upload' | 'library'>('upload');
  const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const isReady = !!objectFile && !!targetMapFile && !isLoading;

  // сбросим загруженные файлы при смене активного изображения
  useEffect(() => {
    setObjectFile(null);
    setTargetMapFile(null);
  }, [activeImageUrl]);

  // превью объекта
  useEffect(() => {
    if (!objectFile) {
      setObjectPreview(null);
      return;
    }
    const url = URL.createObjectURL(objectFile);
    setObjectPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [objectFile]);

  // превью карты-указателя
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
   * Загрузчик библиотеки (вкладка "Библиотека").
   * Подгружаем только при первом входе на вкладку.
   */
  useLayoutEffect(() => {
    if (mode !== 'library' || libraryAssets.length > 0) return;

    const fetchLibrary = async () => {
      setIsLoadingLibrary(true);
      setError(null);
      try {
        const res = await fetch('/api/library/assets?type=2d_object');
        if (!res.ok) throw new Error('Failed to load library');
        const data: LibraryAsset[] = await res.json();
        setLibraryAssets(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load error');
      } finally {
        setIsLoadingLibrary(false);
      }
    };

    fetchLibrary();
  }, [mode, libraryAssets.length]);

  /**
   * Выбор ассета из библиотеки:
   * - тянем файл по прямой ссылке
   * - открываем кроппер на этот источник
   * - переключаемся на вкладку "Загрузить" для показа превью и стандартного UX
   */
  const handleLibrarySelect = async (asset: LibraryAsset) => {
    setError(null);
    try {
      const res = await fetch(asset.fileUrl);
      if (!res.ok) throw new Error('Failed to download asset');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // отдадим кропперу
      setCropRequest(url);
      // вернемся на вкладку upload, чтобы логика и превью были как обычно
      setMode('upload');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  };

  /**
   * Загрузка своего файла (старое поведение)
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
    setCropRequest(url);
  };

  /**
   * Подтверждение кропа — формируем File и сохраняем как objectFile
   */
  const handleCropConfirm = (croppedBlob: Blob) => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);

    const croppedFile = new File([croppedBlob], 'object_crop.png', { type: 'image/png' });
    setObjectFile(croppedFile);
  };

  /**
   * Отмена кропа — просто чистим стейт и освобождаем URL
   */
  const handleCropCancel = () => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);
  };

  /**
   * Подтверждение расстановки указателя — сохраняем target map
   */
  const handlePointerConfirm = (blob: Blob) => {
    const file = new File([blob], 'target_map.png', { type: 'image/png' });
    setTargetMapFile(file);
    setIsPointerEditorOpen(false);
  };

  /**
   * Сабмит — отдаем оба файла и выбранную модель
   */
  const handleSubmit = () => {
    if (!isReady || !targetMapFile || !objectFile) return;
    onGenerate(targetMapFile, objectFile, selectedModel);
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок 1: Загрузка Объекта */}
        <div>
          <Label title="1. Upload Object" />

          {/* Табы: свой файл / библиотека */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-900 border border-gray-700 rounded-lg mb-3">
            <button
              onClick={() => setMode('upload')}
              className={cx(
                'py-1 rounded-md text-xs font-semibold transition-colors',
                mode === 'upload' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
              )}
              type="button"
            >
              Upload Own
            </button>
            <button
              onClick={() => setMode('library')}
              className={cx(
                'py-1 rounded-md text-xs font-semibold transition-colors',
                mode === 'library' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
              )}
              type="button"
            >
              Library
            </button>
          </div>

          {/* Режим: Загрузить свой (старый UI обернут в условие) */}
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
                {objectPreview ? 'Replace Object' : '+ Select Object'}
              </button>
              {objectPreview && (
                <div className="mt-3 relative h-20 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                  <Image
                    src={objectPreview}
                    alt="Object preview"
                    fill
                    sizes="120px"
                    className="object-contain"
                  />
                  <button
                    onClick={() => setObjectFile(null)}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition"
                    title="Remove Object"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Режим: Библиотека 2D-объектов */}
          {mode === 'library' && (
            <div className="p-2 bg-gray-900 border border-gray-700 rounded-lg">
              {isLoadingLibrary && (
                <p className="text-xs text-gray-400 text-center py-4">Loading...</p>
              )}
              {!isLoadingLibrary && libraryAssets.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                  2D Object Library is empty.
                </p>
              )}
              <div className="grid grid-cols-4 gap-2 max-h-[150px] overflow-y-auto">
                {libraryAssets.map((asset) => (
                  <button
                    key={asset.id}
                    title={asset.name}
                    onClick={() => handleLibrarySelect(asset)}
                    className="aspect-square relative rounded-md bg-gray-800 overflow-hidden border border-gray-600 hover:border-cyan-500"
                    type="button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.thumbnailUrl ?? asset.fileUrl}
                      alt={asset.name}
                      className="w-full h-full object-contain"
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

        {/* Блок 2: Указание Цели */}
        <div>
          <Label title="2. Indicate Place on Photo" />
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
                onClick={() => setTargetMapFile(null)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition"
                title="Remove Pointer"
                type="button"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

        {/* Блок выбора модели */}
        {!hideModelSelector && (
          <div>
            <Label title="Model" />
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
              {(['gemini', 'seedream'] as const).map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={cx(
                    'py-1.5 rounded-md text-xs font-semibold transition-colors',
                    selectedModel === model ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                  )}
                  type="button"
                >
                  {model === 'gemini' ? 'Nano Banana Pro' : 'SeeDream v4.5'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Уточнение (optional) */}
        <div>
          <Label title="Clarification (optional)" />
          <div className="relative">
            <textarea
              rows={2}
              maxLength={180}
              value={helperPrompt}
              onChange={(e) => onHelperPromptChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 pr-12 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Example: place bucket to the right of the stove"
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
            'w-full text-sm font-semibold py-2.5 rounded-lg transition',
            isReady ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          )}
          type="button"
        >
          {isLoading ? 'Processing...' : 'Inject Object'}
        </button>
      </div>

      {/* Модалка редактора указателя */}
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

// src/components/sidebar/StyleTransplanter.tsx
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { cx } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/types';
import { Label } from '../ui/FormControls';
import { UniversalCropper } from '@/components/cropper/UniversalCropper';

type ModelForStyle = 'gemini' | 'seedream';

interface StyleTransplanterProps {
  onGenerate: (referenceFile: File, model: ModelForStyle) => void;
  isLoading: boolean;
  sourceAspectRatio: number; // ОБЯЗАТЕЛЬНО для блокировки кроппера
}

export const StyleTransplanter: React.FC<StyleTransplanterProps> = ({
  onGenerate,
  isLoading,
  sourceAspectRatio,
}) => {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelForStyle>('gemini');

  // Управляет открытием/закрытием кроппера и хранит URL сырого файла
  const [cropRequest, setCropRequest] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReady = referenceFile && !isLoading;

  // Шаг 1: Пользователь выбирает файл, открываем кроппер
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Неверный тип файла. Нужен PNG, JPEG или WebP.');
      return;
    }
    setError(null);

    const url = URL.createObjectURL(file);
    setCropRequest(url);
  };

  // Шаг 2: Кроппер отработал, получаем готовый Blob
  const handleCropConfirm = (croppedBlob: Blob) => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);

    const croppedFile = new File([croppedBlob], "style_crop.png", { type: "image/png" });
    setReferenceFile(croppedFile);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  // Шаг 2.1: Пользователь отменил кроп
  const handleCropCancel = () => {
    if (cropRequest) URL.revokeObjectURL(cropRequest);
    setCropRequest(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Хук для маленького превью уже обрезанного файла
  useEffect(() => {
    if (!referenceFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(referenceFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [referenceFile]);

  const handleSubmit = () => {
    if (!isReady || !referenceFile) return;
    onGenerate(referenceFile, selectedModel);
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок загрузки */}
        <div>
          <Label title="Референс стиля" />
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
            {previewUrl ? 'Заменить стиль' : '+ Загрузить стиль'}
          </button>

          {previewUrl && (
            <div className="mt-3 relative h-20 w-full flex items-center justify-center rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
              <img
                src={previewUrl}
                alt="Style reference preview"
                className="h-full w-auto object-contain"
              />
            </div>
          )}
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        {/* Блок выбора модели */}
        <div>
          <Label title="Модель" />
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
            {(['gemini', 'seedream'] as ModelForStyle[]).map(model => (
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
          {isLoading ? "Обработка..." : "Применить стиль"}
        </button>
      </div>

      {/* Модалка с кроппером, которая всплывет когда надо */}
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
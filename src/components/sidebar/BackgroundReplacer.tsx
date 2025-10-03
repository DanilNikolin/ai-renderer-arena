import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { cx } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/lib/types';
import { Label } from '../ui/FormControls';
import { UniversalCropper } from '@/components/cropper/UniversalCropper';

type ModelForBg = 'gemini' | 'seedream';

interface BackgroundReplacerProps {
  onGenerate: (
    referenceFile: File | null, 
    targets: { window: boolean; door: boolean },
    model: ModelForBg
  ) => void;
  isLoading: boolean;
  // ВАЖНО: Нам нужно знать пропорции исходной сауны, чтобы заблокировать кроппер
  sourceAspectRatio: number;
  helperPrompt: string;
  onHelperPromptChange: (value: string) => void;
}

export const BackgroundReplacer: React.FC<BackgroundReplacerProps> = ({
  onGenerate,
  isLoading,
  sourceAspectRatio,
  helperPrompt,
  onHelperPromptChange,
}) => {
  // Этот стейт теперь хранит ГОТОВЫЙ, ОБРЕЗАННЫЙ файл
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targets, setTargets] = useState({ window: true, door: false });
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelForBg>('gemini');

  // Этот стейт открывает/закрывает кроппер и хранит URL сырого файла
  const [cropRequest, setCropRequest] = useState<string | null>(null);

  const fileIsPresent = !!referenceFile;
  const textIsPresent = helperPrompt.trim().length > 0;
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReady = (referenceFile || helperPrompt.trim()) && (targets.window || targets.door) && !isLoading;

  // Шаг 1: Пользователь выбирает файл, мы открываем кроппер
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  // Шаг 2: Кроппер закончил работу, мы получаем готовый Blob
  const handleCropConfirm = (croppedBlob: Blob) => {
    // Чистим URL и закрываем кроппер
    if (cropRequest) {
      URL.revokeObjectURL(cropRequest);
    }
    setCropRequest(null);

    // Превращаем Blob в File, с которым будет работать остальное приложение
    const croppedFile = new File([croppedBlob], "background_crop.png", { type: "image/png" });
    setReferenceFile(croppedFile);
    // Сбрасываем значение инпута, чтобы можно было загрузить тот же файл еще раз
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  // Шаг 2.1: Пользователь отменил кроп
  const handleCropCancel = () => {
    if (cropRequest) {
      URL.revokeObjectURL(cropRequest);
    }
    setCropRequest(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  
  // Этот хук теперь работает с уже обрезанным файлом для маленького превью
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
    if (!isReady) return; // <<< УБИРАЕМ ПРОВЕРКУ !referenceFile
    onGenerate(referenceFile, targets, selectedModel);
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleTargetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTargets(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок загрузки */}
            <div>
            <Label title="Референс фона" />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={ACCEPTED_FILE_TYPES.join(',')}
                className="hidden"
            />
            <button
                type="button"
                onClick={handleButtonClick}
                disabled={textIsPresent} 
                className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            >
                {previewUrl ? 'Заменить фон' : '+ Загрузить фон'}
            </button>

            {/* Новый блок предпросмотра, который появляется после загрузки */}
            {previewUrl && (
                <div className="mt-3 relative h-20 w-full flex items-center justify-center rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={previewUrl}
                alt="Reference preview"
                className="h-full w-auto object-contain"
            />
            <button 
                onClick={() => setReferenceFile(null)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition"
                title="Убрать фон"
              >✕</button>
                </div>
            )}

            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>

        {/* Блок выбора модели */}
        <div>
          <Label title="Модель" />
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-lg border border-gray-700">
            {(['gemini', 'seedream'] as ModelForBg[]).map(model => (
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

        {/* Блок выбора целей */}
        <div>
          <Label title="Цели для замены" />
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-gray-800 transition">
              <input
                type="checkbox" name="window" checked={targets.window} onChange={handleTargetChange}
                className="accent-cyan-500 w-4 h-4"
              />
              Окна
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-gray-800 transition">
              <input
                type="checkbox" name="door" checked={targets.door} onChange={handleTargetChange}
                className="accent-cyan-500 w-4 h-4"
              />
              Дверь
            </label>
          </div>
        </div>
        <div>
            <Label title={referenceFile ? "Уточнение (опционально)" : "Описание фона (если нет файла)"} />
            <div className="relative">
                <textarea
                      rows={3}
                      maxLength={180}
                      value={helperPrompt}
                      onChange={(e) => onHelperPromptChange(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 pr-12 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder={referenceFile ? "Пример: сделать лес более туманным" : "Пример: заснеженные горы на рассвете"}
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
          {isLoading ? "Обработка..." : "Заменить фон"}
        </button>
      </div>

      {/* Модальное окно с кроппером, которое рендерится только когда нужно */}
      {cropRequest && (
        <UniversalCropper
          imageSrc={cropRequest}
          aspectRatio={sourceAspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          // Можно добавить кастомные тексты, если наш UniversalCropper их поддерживает
          // title="Обрежьте фон под пропорции сауны"
          // confirmButtonText="Применить фон"
        />
      )}
    </>
  );
};
// src/components/sidebar/ObjectInjector3D.tsx
import React, { useState, useRef, ChangeEvent, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import { Label } from '../ui/FormControls';
import { PhotoboothModal } from '../editor/PhotoboothModal';

interface ObjectInjector3DProps {
  saunaImageUrl: string | null;
  onGenerate: (targetMapFile: File, referenceObjectFile: File, helperPrompt: string) => void;
}

// Тип ассета из библиотеки
type LibraryAsset = {
  id: string;
  name: string;
  type: '2d_object' | '3d_object';
  fileUrl: string;
  thumbnailUrl: string | null;
};

export const ObjectInjector3D: React.FC<ObjectInjector3DProps> = ({ saunaImageUrl, onGenerate }) => {
  // Базовые стейты
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetMapFile, setTargetMapFile] = useState<File | null>(null);
  const [referenceObjectFile, setReferenceObjectFile] = useState<File | null>(null);
  const [helperPrompt, setHelperPrompt] = useState('');

  const [targetMapPreviewUrl, setTargetMapPreviewUrl] = useState<string | null>(null);
  const [referenceObjectPreviewUrl, setReferenceObjectPreviewUrl] = useState<string | null>(null);

  // Библиотека ассетов
  const [mode, setMode] = useState<'upload' | 'library'>('upload');
  const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Превью targetMapFile
  useEffect(() => {
    if (targetMapFile) {
      const url = URL.createObjectURL(targetMapFile);
      setTargetMapPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setTargetMapPreviewUrl(null);
  }, [targetMapFile]);

  // Превью referenceObjectFile
  useEffect(() => {
    if (referenceObjectFile) {
      const url = URL.createObjectURL(referenceObjectFile);
      setReferenceObjectPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setReferenceObjectPreviewUrl(null);
  }, [referenceObjectFile]);

  // Открытие модалки при выборе модели
  useEffect(() => {
    if (modelFile) {
      setIsModalOpen(true);
      setTargetMapFile(null);
      setReferenceObjectFile(null);
    }
  }, [modelFile]);

  // Подгрузка библиотеки при входе в таб "Библиотека" и пустом списке
  useLayoutEffect(() => {
    if (mode !== 'library' || libraryAssets.length > 0) return;

    const fetchLibrary = async () => {
      setIsLoadingLibrary(true);
      setError(null);
      try {
        const res = await fetch('/api/library/assets?type=3d_object');
        if (!res.ok) throw new Error('Не удалось загрузить библиотеку 3D');
        const data = await res.json();
        setLibraryAssets(data as LibraryAsset[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        setIsLoadingLibrary(false);
      }
    };

    fetchLibrary();
  }, [mode, libraryAssets.length]);

  // Выбор ассета из библиотеки
  const handleLibrarySelect = async (asset: LibraryAsset) => {
    setError(null);
    try {
      const res = await fetch(asset.fileUrl);
      if (!res.ok) throw new Error('Не удалось скачать 3D ассет');
      const blob = await res.blob();

      const fileName = asset.fileUrl.split('/').pop() || 'model.glb';
      const file = new File([blob], fileName, { type: blob.type });

      setModelFile(file);   // триггерит открытие модалки
      setMode('upload');    // возвращаемся на вкладку "Загрузить"
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  // Выбор файла модели из диска
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fileName = file?.name.toLowerCase() || '';
    if (file && (fileName.endsWith('.glb') || fileName.endsWith('.gltf') || fileName.endsWith('.obj'))) {
      setModelFile(file);
    } else if (file) {
      alert('Неверный формат файла. Поддерживаются .glb, .gltf, .obj');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  // Коллбэки модалки
  const handleModalConfirm = (targetMapBlob: Blob, referenceObjectBlob: Blob) => {
    console.log('ПЕРЕХВАЧЕНЫ БЛОБЫ ИЗ МОДАЛКИ:', { targetMapBlob, referenceObjectBlob });
    const targetUrl = URL.createObjectURL(targetMapBlob);
    const refUrl = URL.createObjectURL(referenceObjectBlob);
    console.log('КАРТА ЦЕЛИ (скопируй и вставь в браузер):', targetUrl);
    console.log('РЕФЕРЕНС ОБЪЕКТА (скопируй и вставь в браузер):', refUrl);

    setTargetMapFile(new File([targetMapBlob], 'target_map.png', { type: 'image/png' }));
    setReferenceObjectFile(new File([referenceObjectBlob], 'reference_object.png', { type: 'image/png' }));
    setIsModalOpen(false);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setModelFile(null);
  };

  // Управление результатами и отправкой
  const handleClearResults = () => {
    setTargetMapFile(null);
    setReferenceObjectFile(null);
  };

  const handleSubmit = () => {
    if (!targetMapFile || !referenceObjectFile) return;
    onGenerate(targetMapFile, referenceObjectFile, helperPrompt);
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        {/* Блок загрузки модели / библиотека */}
        <div className="space-y-2">
          <Label title="3D Модель (.glb, .gltf, .obj)" />

          {/* Табы: Загрузка / Библиотека */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-900 border border-gray-700 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`py-1 rounded-md text-xs font-semibold transition-colors ${
                mode === 'upload' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Загрузить свою
            </button>
            <button
              type="button"
              onClick={() => setMode('library')}
              className={`py-1 rounded-md text-xs font-semibold transition-colors ${
                mode === 'library' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              Библиотека
            </button>
          </div>

          {/* Загрузка своей модели */}
          {mode === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".glb,.gltf,.obj"
                className="hidden"
              />
              <button
                type="button"
                onClick={handleButtonClick}
                className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition flex justify-center items-center min-w-0"
              >
                <span className="truncate">
                  {modelFile ? `Заменить: ${modelFile.name}` : '+ Выбрать 3D модель'}
                </span>
              </button>
            </div>
          )}

          {/* Просмотр библиотеки */}
          {mode === 'library' && (
            <div className="p-2 bg-gray-900 border border-gray-700 rounded-lg">
              {isLoadingLibrary && (
                <p className="text-xs text-gray-400 text-center py-4">Загрузка...</p>
              )}
              {error && <p className="text-xs text-red-400 text-center py-2">{error}</p>}
              {!isLoadingLibrary && libraryAssets.length === 0 && !error && (
                <p className="text-xs text-gray-500 text-center py-4">Библиотека 3D-моделей пуста.</p>
              )}
              <div className="grid grid-cols-4 gap-2 max-h-[150px] overflow-y-auto">
                {libraryAssets.map((asset) => (
                  <button
                    key={asset.id}
                    title={asset.name}
                    type="button"
                    onClick={() => handleLibrarySelect(asset)}
                    className="aspect-square relative rounded-md bg-gray-800 overflow-hidden border border-gray-600 hover:border-cyan-500"
                  >
                    {/* Заглушка под 3D-превью */}
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c-.5-.8-.8-1.8-.8-2.8 0-2.2 1.8-4 4-4v-.5"></path>
                        <path d="M3.8 12c.7 0 1.3-.3 1.7-.8.4-.5.8-1.2 1.2-2 .5-1 1.2-1.8 2.4-2.4"></path>
                        <path d="m13.3 16 1.2-1.2 2.5 3 2.5-3 1.2 1.2"></path>
                        <path d="M18 2v.5c0 1.1-.4 2.1-1.1 2.9-.7.8-1.6 1.3-2.7 1.6"></path>
                        <path d="M8 3v1.2c0 .8-.2 1.5-.6 2.2-.4.7-1 1.3-1.8 1.7"></path>
                        <path d="M18 2c-1.5 0-2.8.8-3.5 2.1 -.7 1.3-.7 3.2 0 4.6"></path>
                        <path d="m9 8.3 1.2-1.2 2.5 3 2.5-3 1.2 1.2"></path>
                        <path d="M8 3C6.7 3 5.5 3.5 4.7 4.4L3.4 6.3"></path>
                        <path d="m2 12 1 10"></path>
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 text-[9px] bg-black/60 text-white truncate px-1 py-0.5">
                      {asset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && !isLoadingLibrary && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
        </div>

        {/* Превью для AI */}
        {targetMapPreviewUrl && referenceObjectPreviewUrl && (
          <div className="space-y-3">
            <Label title="Превью для AI" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative h-24 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                <Image
                  src={targetMapPreviewUrl}
                  alt="Target map"
                  fill
                  sizes="150px"
                  className="object-contain"
                />
              </div>
              <div className="relative h-24 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                <Image
                  src={referenceObjectPreviewUrl}
                  alt="Reference object"
                  fill
                  sizes="150px"
                  className="object-contain"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearResults}
              className="w-full text-center text-xs text-red-400 hover:text-red-300"
            >
              Очистить
            </button>
          </div>
        )}

        {/* Уточнение и отправка */}
        <div className="space-y-3">
          <Label title="Уточнение (опционально)" />
          <textarea
            rows={2}
            maxLength={180}
            value={helperPrompt}
            onChange={(e) => setHelperPrompt(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500"
            placeholder="Например, сделай объект более блестящим"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!targetMapFile || !referenceObjectFile}
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-cyan-600 transition disabled:bg-gray-800 disabled:text-gray-500 hover:bg-cyan-500"
          >
            Интегрировать объект
          </button>
        </div>
      </div>

      {isModalOpen && modelFile && (
        <PhotoboothModal
          modelFile={modelFile}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
          saunaImageUrl={saunaImageUrl}
        />
      )}
    </>
  );
};

// src/components/sidebar/ObjectInjector3D.tsx
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Label } from '../ui/FormControls';
import { PhotoboothModal } from '../editor/PhotoboothModal';
import Image from 'next/image';

interface ObjectInjector3DProps {
  saunaImageUrl: string | null;
  onGenerate: (targetMapFile: File, referenceObjectFile: File, helperPrompt: string) => void;
}

export const ObjectInjector3D: React.FC<ObjectInjector3DProps> = ({ saunaImageUrl, onGenerate }) => {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetMapFile, setTargetMapFile] = useState<File | null>(null);
  const [referenceObjectFile, setReferenceObjectFile] = useState<File | null>(null);
  const [helperPrompt, setHelperPrompt] = useState(''); // <<< Стейт для промпта

  const [targetMapPreviewUrl, setTargetMapPreviewUrl] = useState<string | null>(null);
  const [referenceObjectPreviewUrl, setReferenceObjectPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (targetMapFile) {
      const url = URL.createObjectURL(targetMapFile);
      setTargetMapPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setTargetMapPreviewUrl(null);
  }, [targetMapFile]);

  useEffect(() => {
    if (referenceObjectFile) {
      const url = URL.createObjectURL(referenceObjectFile);
      setReferenceObjectPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setReferenceObjectPreviewUrl(null);
  }, [referenceObjectFile]);

  useEffect(() => {
    if (modelFile) {
      setIsModalOpen(true);
      setTargetMapFile(null);
      setReferenceObjectFile(null);
    }
  }, [modelFile]);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fileName = file?.name.toLowerCase() || '';
    // <<< Гибкая проверка
    if (file && (fileName.endsWith('.glb') || fileName.endsWith('.gltf') || fileName.endsWith('.obj'))) {
      setModelFile(file);
    } else if (file) {
      alert('Неверный формат файла. Поддерживаются .glb, .gltf, .obj');
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleModalConfirm = (targetMapBlob: Blob, referenceObjectBlob: Blob) => {
  // ===== ВСТАВЬ ЭТОТ БЛОК ДЛЯ ДИАГНОСТИКИ =====
  console.log('ПЕРЕХВАЧЕНЫ БЛОБЫ ИЗ МОДАЛКИ:', { targetMapBlob, referenceObjectBlob });

  const targetUrl = URL.createObjectURL(targetMapBlob);
  const refUrl = URL.createObjectURL(referenceObjectBlob);
  console.log('КАРТА ЦЕЛИ (скопируй и вставь в браузер):', targetUrl);
  console.log('РЕФЕРЕНС ОБЪЕКТА (скопируй и вставь в браузер):', refUrl);
  // ============================================

  setTargetMapFile(new File([targetMapBlob], "target_map.png", { type: 'image/png' }));
  setReferenceObjectFile(new File([referenceObjectBlob], "reference_object.png", { type: 'image/png' }));
  setIsModalOpen(false);
};

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setModelFile(null);
  };

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
        {/* Блок загрузки модели */}
        <div className="space-y-2">
          {/* <<< ИСПРАВЛЕНО: Убрали "Шаг 1", обновили форматы */}
          <Label title="3D Модель (.glb, .gltf, .obj)" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".glb,.gltf,.obj" // <<< Убедимся, что accept тоже верный
            className="hidden"
          />
          <button
            type="button"
            onClick={handleButtonClick}
            // <<< ИСПРАВЛЕНО: Добавили flex-классы для контроля над переполнением
            className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition flex justify-center items-center min-w-0"
          >
            {/* <<< ИСПРАВЛЕНО: Обернули текст в span с truncate */}
            <span className="truncate">
              {modelFile ? `Заменить: ${modelFile.name}` : '+ Выбрать 3D модель'}
            </span>
          </button>
        </div>

        {/* Блок с превью для AI */}
        {(targetMapPreviewUrl && referenceObjectPreviewUrl) && (
          <div className="space-y-3">
            {/* <<< ИСПРАВЛЕНО: Убрали "Шаг 2" */}
            <Label title="Превью для AI" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative h-24 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                <Image src={targetMapPreviewUrl} alt="Target map" fill sizes="150px" className="object-contain" />
              </div>
              <div className="relative h-24 w-full rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                <Image src={referenceObjectPreviewUrl} alt="Reference object" fill sizes="150px" className="object-contain" />
              </div>
            </div>
            <button onClick={handleClearResults} className="w-full text-center text-xs text-red-400 hover:text-red-300">Очистить</button>
          </div>
        )}
        
        {/* Блок уточнений и отправки */}
        <div className="space-y-3">
          {/* <<< ИСПРАВЛЕНО: Убрали "Шаг 3", сделали заголовок по твоей идее */}
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
          modelFile={modelFile} onConfirm={handleModalConfirm} onCancel={handleModalCancel} saunaImageUrl={saunaImageUrl}
        />
      )}
    </>
  );
};

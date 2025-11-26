// src/app/pipeline-test/page.tsx
"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { usePipelineTest } from "@/hooks/usePipelineTest";
import { cx } from "@/lib/utils";

/* ───────────────────────── мини-утилиты ───────────────────────── */

const CollapsibleDebug: React.FC<{
  title: string;
  content: string | null;
}> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!content && !isOpen) return null; // Не рендерим, если контента нет (но позволяем открыть, если уже открыт)

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full text-left text-sm font-medium text-yellow-400 p-3"
      >
        {isOpen ? "▼" : "►"} {title}
      </button>
      {isOpen && (
        <div className="p-3 border-t border-gray-700/50">
          <PreBlock className="min-h-0 max-h-60">
            {content || "Ответ от LLM был пустым (null)."}
          </PreBlock>
        </div>
      )}
    </div>
  );
};

const Label: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
  <label className={cx("block text-xs text-gray-300 mb-1.5", className)}>{title}</label>
);

const TextArea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
}> = ({ value, onChange, rows = 5, placeholder }) => (
  <textarea
    rows={rows}
    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

const TextInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
  />
);

const PreBlock: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <pre className={cx("w-full min-h-[140px] bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-auto", className)}>
    <code>{children}</code>
  </pre>
);

/* ───────────────────────── Lightbox / Modal ───────────────────────── */

const LightboxModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  src?: string | null;
  alt?: string;
}> = ({ isOpen, onClose, src, alt }) => {
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      tabIndex={-1}
    >
      <div className="relative max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {src ? (
          <Image
            src={src}
            alt={alt || "Image preview"}
            width={1600}
            height={900}
            className="object-contain max-h-[90vh] w-auto h-auto"
            priority
          />
        ) : (
          <div className="text-gray-400">Нет изображения</div>
        )}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 rounded-full bg-gray-800 text-white w-8 h-8 grid place-items-center border border-gray-700"
          aria-label="Закрыть предпросмотр"
          title="Закрыть"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/* ───────────────────────── Compare Slider (до/после) ───────────────────────── */

const CompareSlider: React.FC<{
  beforeUrl: string;
  afterUrl: string;
  className?: string;
  labels?: { before?: string; after?: string };
}> = ({ beforeUrl, afterUrl, className, labels }) => {
  const [pos, setPos] = useState(50); // %
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointer = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPos(Math.round((x / rect.width) * 100));
  }, []);

  return (
    <div
      ref={containerRef}
      className={cx(
        "relative w-full aspect-[1.99] overflow-hidden rounded-lg border border-gray-700 bg-gray-900 select-none touch-none",
        className
      )}
      onMouseDown={(e) => onPointer(e.clientX)}
      onMouseMove={(e) => e.buttons === 1 && onPointer(e.clientX)}
      onTouchStart={(e) => onPointer(e.touches[0].clientX)}
      onTouchMove={(e) => onPointer(e.touches[0].clientX)}
      role="group"
      aria-label="Сравнение изображений"
    >
      {/* after (нижняя) */}
      <Image src={afterUrl} alt={labels?.after || "after"} fill sizes="40vw" className="object-contain" />
      {/* before (верхняя с маской) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        aria-hidden="true"
      >
        <Image src={beforeUrl} alt={labels?.before || "before"} fill sizes="40vw" className="object-contain" />
      </div>

      {/* ручка */}
      <div
        className="absolute top-0 bottom-0"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="h-full w-[2px] bg-white/70 pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 right-0 flex justify-center">
          <div className="rounded-full bg-white/90 text-gray-900 text-xs px-2 py-1 border border-gray-200">
            Перетащи
          </div>
        </div>
      </div>

      {/* подписи */}
      <div className="absolute left-2 top-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
        {labels?.before ?? "До"}
      </div>
      <div className="absolute right-2 top-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
        {labels?.after ?? "После"}
      </div>
    </div>
  );
};

/* ───────────────────────── Image Card ───────────────────────── */

const ImageCard: React.FC<{
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  onClick?: () => void;
}> = ({ title, imageUrl, isLoading, onClick = () => {} }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      <button
        type="button"
        disabled={!imageUrl}
        onClick={onClick}
        className={cx(
          "relative aspect-[1.99] w-full rounded-lg border overflow-hidden transition",
          imageUrl ? "hover:scale-[1.01] hover:border-cyan-500" : "",
          "border-gray-700 bg-gray-900",
          "flex items-center justify-center" // <-- ВОТ ЭТО
        )}
        aria-label={imageUrl ? "Открыть изображение" : "Изображение отсутствует"}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        )}
        {!isLoading && !imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">Ожидание…</div>
        )}
        {imageUrl && (
          <Image 
            src={imageUrl} 
            alt={title} 
            width={1536}
            height={896}
            sizes="30vw" 
            className="w-full h-full object-contain"
          />
        )}
      </button>
    </div>
  );
};

/* ───────────────────────── Dropzone ───────────────────────── */

const Dropzone: React.FC<{
  file?: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  dropRef: React.Ref<HTMLLabelElement>;
}> = ({ file, onFileChange, onDrop, dropRef }) => {
  return (
    <label
      ref={dropRef}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cx(
        "group border border-dashed rounded-lg cursor-pointer transition p-4 text-center",
        "border-gray-700 hover:border-cyan-500 bg-gray-900/50"
      )}
      title="Перетащите файл или кликните"
    >
      <div className="min-h-[64px] flex flex-col items-center justify-center gap-1">
        {file ? (
          <span className="text-sm text-gray-200">Загружен: {file.name}</span>
        ) : (
          <>
            <span className="text-sm text-gray-200">Перетащи или нажми</span>
            <span className="text-xs text-gray-500">чтобы загрузить скетч</span>
          </>
        )}
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFileChange}
      />
    </label>
  );
};

/* ───────────────────────── Страница ───────────────────────── */

export default function PipelineTestPage() {
  const {
    // Файлы
    sourceFile,
    sourceUrl,
    onFileChange,
    onDrop,
    dropRef,

    // Состояние
    isLoading,
    isRefining,
    error,
    refineError,
    
    // <<< ИЗМЕНЕНИЯ ТУТ >>>
    step1ResultUrl,
    step2ResultUrl,

    // Промты
    rawPrompt,
    setRawPrompt,
    step1Prompt,
    setStep1Prompt,
    step2Prompt,
    setStep2Prompt,
    // <<< КОНЕЦ ИЗМЕНЕНИЙ >>>

    windowView,
    setWindowView,
    doorView,
    setDoorView,
    rawLlmResponse, 

    // Действия
    handleRefine,
    handleStep1,
    handleStep2,
    onCancel,
    clearAll,
  } = usePipelineTest();

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const openLightbox = (src: string | null) => {
    if (!src) return;
    setLightboxSrc(src);
    setLightboxOpen(true);
  };

  // Преднаборы сравнения
  const hasSource = Boolean(sourceUrl);
  // <<< ИЗМЕНЕНИЯ ТУТ >>>
  const hasStep1 = Boolean(step1ResultUrl);
  const hasStep2 = Boolean(step2ResultUrl);

  const comparePairs = useMemo(() => {
    const pairs: { key: string; before: string; after: string; label: string }[] = [];
    if (hasSource && hasStep1 && sourceUrl && step1ResultUrl) {
      pairs.push({ key: "source-step1", before: sourceUrl, after: step1ResultUrl, label: "Исходник → Qwen1" });
    }
    if (hasStep1 && hasStep2 && step1ResultUrl && step2ResultUrl) {
      pairs.push({ key: "step1-step2", before: step1ResultUrl, after: step2ResultUrl, label: "Qwen1 → Qwen2" });
    }
    if (hasSource && hasStep2 && sourceUrl && step2ResultUrl) {
      pairs.push({ key: "source-step2", before: sourceUrl, after: step2ResultUrl, label: "Исходник → Qwen2" });
    }
    return pairs;
  }, [hasSource, hasStep1, hasStep2, sourceUrl, step1ResultUrl, step2ResultUrl]);
  // <<< КОНЕЦ ИЗМЕНЕНИЙ >>>

  const [activePairKey, setActivePairKey] = useState<string | null>(null);

  // Автовыбор первой доступной пары
  React.useEffect(() => {
    if (!activePairKey && comparePairs[0]) setActivePairKey(comparePairs[0].key);
    if (activePairKey && !comparePairs.find((p) => p.key === activePairKey)) {
      setActivePairKey(comparePairs[0]?.key ?? null);
    }
  }, [activePairKey, comparePairs]);

  const activePair = useMemo(() => comparePairs.find((p) => p.key === activePairKey) || null, [comparePairs, activePairKey]);

  return (
    <main>
      <div className="container-narrow">
        {/* Header */}
        <header className="my-6 flex flex-col md:flex-row gap-3 md:gap-0 md:justify-between md:items-center">
          <div>
            {/* <<< ИЗМЕНЕНИЯ ТУТ (ТЕКСТ) >>> */}
            <h1 className="text-2xl font-bold text-cyan-400 text-glow">Тестовый Пайплайн (LLM → Qwen (Шаг 1) → Qwen (Шаг 2))</h1>
            <p className="text-gray-400 text-sm mt-1">Прототип двухшаговой генерации с авто-промтом</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Очистить
            </button>
            {(isLoading || isRefining) && (
              <button
                onClick={onCancel}
                className="text-xs px-3 py-1.5 rounded bg-red-700 text-white hover:bg-red-600"
              >
                Отменить
              </button>
            )}
          </div>
        </header>

        {/* Ошибки */}
        {error && (
          <div className="mb-4 text-red-300 text-sm bg-red-900/30 border border-red-800/40 rounded p-3">
            <p className="font-semibold">Ошибка генерации</p>
            <p>{error}</p>
          </div>
        )}
        {refineError && (
          <div className="mb-4 text-yellow-300 text-sm bg-yellow-900/30 border border-yellow-800/40 rounded p-3">
            <p className="font-semibold">Ошибка LLM</p>
            <p>{refineError}</p>
          </div>
        )}

        {/* Сравнение (если есть хотя бы одна пара) */}
        {activePair && (
          <section className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">Сравнение «до/после»</h2>
              <div className="flex gap-2">
                {comparePairs.map((p) => (
                  <button
                    key={p.key}
                    className={cx(
                      "text-xs px-2 py-1 rounded border",
                      p.key === activePairKey
                        ? "border-cyan-500 text-cyan-200"
                        : "border-gray-700 text-gray-400 hover:text-gray-200"
                    )}
                    onClick={() => setActivePairKey(p.key)}
                    title={p.label}
                  >
                    {p.label} {/* <<< ИЗМЕНЕНИЯ ТУТ (ТЕКСТ УЖЕ ИЗ comparePairs) >>> */}
                  </button>
                ))}
              </div>
            </div>
            <CompareSlider
              beforeUrl={activePair.before}
              afterUrl={activePair.after}
              labels={{ before: "До", after: "После" }}
            />
          </section>
        )}

        {/* Основная сетка */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Колонка 1: исходник и LLM */}
          <div className="space-y-4">
            <ImageCard
              title="Шаг 0: Исходник"
              imageUrl={sourceUrl}
              onClick={() => openLightbox(sourceUrl)}
            />

            <Dropzone file={sourceFile} onFileChange={onFileChange} onDrop={onDrop} dropRef={dropRef} />

            <Label title="Грязный промт (для LLM)" />
            <TextArea value={rawPrompt} onChange={setRawPrompt} rows={4} placeholder="Стены — кедр, пол — камень..." />

            <Label title="Вид из окна" />
            <TextInput value={windowView} onChange={setWindowView} placeholder="лес/море/город…" />

            <Label title="Вид из двери" />
            <TextInput value={doorView} onChange={setDoorView} placeholder="коридор/сад/терраса…" />

            <button
              onClick={handleRefine}
              disabled={isRefining || isLoading || !sourceFile}
              className="w-full text-sm font-semibold py-2.5 rounded-lg transition bg-purple-700 hover:bg-purple-600 text-white disabled:bg-gray-700 disabled:text-gray-400"
            >
              {isRefining ? "Думаю..." : "✍️ Отправить LLM"}
            </button>

            <CollapsibleDebug
              title="Сырой ответ LLM"
              content={rawLlmResponse}
            />
          </div>

          {/* Колонка 2: Qwen (Шаг 1) */}
          <div className="space-y-4">
            {/* <<< ИЗМЕНЕНИЯ ТУТ (ТЕКСТ И ПЕРЕМЕННЫЕ) >>> */}
            <ImageCard
              title="Шаг 1: Qwen (База)"
              imageUrl={step1ResultUrl}
              isLoading={isLoading && !step1ResultUrl}
              onClick={() => openLightbox(step1ResultUrl)}
            />

            <Label title="Промт для Шага 1 (редактируемый)" />
            <TextArea
              value={step1Prompt}
              onChange={setStep1Prompt}
              rows={10}
              placeholder="Промт для Шага 1 (заполнение проемов)..."
            />

            <button
              onClick={handleStep1}
              disabled={isLoading || isRefining || !sourceFile}
              className="w-full text-sm font-semibold py-2.5 rounded-lg transition bg-cyan-700 hover:bg-cyan-600 text-white disabled:bg-gray-700 disabled:text-gray-400"
            >
              {isLoading && !step1ResultUrl ? "..." : "Шаг 1: Заполнить проемы"}
            </button>
            {/* <<< КОНЕЦ ИЗМЕНЕНИЙ >>> */}
          </div>

          {/* Колонка 3: Qwen (Шаг 2) */}
          <div className="space-y-4">
            {/* <<< ИЗМЕНЕНИЯ ТУТ (ТЕКСТ И ПЕРЕМЕННЫЕ) >>> */}
            <ImageCard
              title="Шаг 2: Qwen (Финал)"
              imageUrl={step2ResultUrl}
              isLoading={isLoading && !!step1ResultUrl && !step2ResultUrl}
              onClick={() => openLightbox(step2ResultUrl)}
            />

            <Label title="Промт для Шага 2 (редактируемый)" />
            <TextArea
              value={step2Prompt}
              onChange={setStep2Prompt}
              rows={10}
              placeholder="Финальный промт для Qwen (материалы, свет)..."
            />

            <button
              onClick={handleStep2}
              disabled={isLoading || isRefining || !step1ResultUrl}
              className="w-full text-sm font-semibold py-2.5 rounded-lg transition bg-green-600 hover:bg-green-500 text-white disabled:bg-gray-700 disabled:text-gray-400"
            >
              {isLoading && step1ResultUrl ? "..." : "Шаг 2: Сделать круто"}
            </button>
            {/* <<< КОНЕЦ ИЗМЕНЕНИЙ >>> */}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={lightboxSrc || undefined}
        alt="Просмотр изображения"
      />
    </main>
  );
}
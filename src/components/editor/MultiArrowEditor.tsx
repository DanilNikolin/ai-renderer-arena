import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Тип для описания одной стрелки с инструкцией
type ArrowInstruction = {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  text: string;
};

const TOKEN_LIMIT_CHARS = 100; // ~20-25 токенов

// SVG-иконка. Та же, что и в ArrowPointer
const ArrowSvg = ({ rotation }: { rotation: number }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 150 90"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: `rotate(${rotation}deg)`,
      filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.7))',
      pointerEvents: 'none',
    }}
  >
    <path
      d="M50 0 L100 45 L70 45 L70 90 L30 90 L30 45 L0 45 Z"
      fill="#FF0000"
      stroke="#6D0000"
      strokeWidth="2.3"
    />
  </svg>
);

export const MultiArrowEditor: React.FC<{
  imageSrc: string;
  onConfirm: (imageBlob: Blob, instructionsText: string) => void;
  onCancel: () => void;
}> = ({ imageSrc, onConfirm, onCancel }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [arrows, setArrows] = useState<ArrowInstruction[]>([]);
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const selectedArrow = arrows.find((a) => a.id === selectedArrowId) || null;

  // --- Загрузка изображения ---
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => setImg(image);
  }, [imageSrc]);

  // --- Отрисовка: стабильная функция через useCallback ---
  const draw = useCallback(() => {
    if (!img || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    if (parentRect.width === 0 || parentRect.height === 0) return;

    const imgAspect = img.width / img.height;
    const parentAspect = parentRect.width / parentRect.height;

    let cssWidth: number;
    let cssHeight: number;

    if (imgAspect > parentAspect) {
      cssWidth = parentRect.width;
      cssHeight = parentRect.width / imgAspect;
    } else {
      cssHeight = parentRect.height;
      cssWidth = parentRect.height * imgAspect;
    }

    // Внутреннее разрешение = оригинал (качество), CSS — под экран
    canvas.width = img.width;
    canvas.height = img.height;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [img]);

  // Первый рендер и подписка на resize — на стабильную draw
  useLayoutEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  // Клавиатура: Escape = отмена
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // --- Управление стрелками ---
  const updateArrow = (id: string, updates: Partial<ArrowInstruction>) => {
    setArrows((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const addArrow = () => {
    if (arrows.length >= 5) return;

    const parent = canvasRef.current?.parentElement;
    const parentRect = parent?.getBoundingClientRect();
    const centerX = (parentRect?.width ?? 300) / 2;
    const centerY = (parentRect?.height ?? 300) / 2;

    const newArrow: ArrowInstruction = {
      id: `arrow_${Date.now()}`,
      x: centerX,
      y: centerY,
      size: 100,
      rotation: 0,
      text: '',
    };

    setArrows((prev) => [...prev, newArrow]);
    setSelectedArrowId(newArrow.id);
  };

  const deleteSelectedArrow = () => {
    if (!selectedArrowId) return;
    setArrows((prev) => prev.filter((a) => a.id !== selectedArrowId));
    setSelectedArrowId(null);
  };

  const handleTextChange = (id: string, newText: string) => {
    if (newText.length > TOKEN_LIMIT_CHARS) return;
    updateArrow(id, { text: newText });
  };

  // --- Drag-n-Drop ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const el = e.currentTarget as HTMLDivElement;
    el.setPointerCapture(e.pointerId);

    setSelectedArrowId(id);

    const targetRect = el.getBoundingClientRect();
    const parentRect = el.parentElement!.getBoundingClientRect();

    const xInParent = targetRect.left - parentRect.left;
    const yInParent = targetRect.top - parentRect.top;

    const offsetX = e.clientX - parentRect.left - xInParent;
    const offsetY = e.clientY - parentRect.top - yInParent;

    dragRef.current = { id, offsetX, offsetY };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const parentRect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const newX = e.clientX - parentRect.left - dragRef.current.offsetX;
    const newY = e.clientY - parentRect.top - dragRef.current.offsetY;

    updateArrow(dragRef.current.id, { x: newX, y: newY });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  // --- Подтверждение: «запекаем» стрелки и текст в PNG ---
  const handleConfirm = () => {
    if (!img || !canvasRef.current) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = img.width;
    offscreen.height = img.height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    // фон
    ctx.drawImage(img, 0, 0);

    // scale факторы между экранным canvas и исходником
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = img.width / rect.width;
    const scaleY = img.height / rect.height;

    const instructions: string[] = [];

    arrows.forEach((arrow) => {
      if (arrow.text.trim()) instructions.push(arrow.text.trim());

      // экранные координаты → координаты исходника
      const realX = arrow.x * scaleX;
      const realY = arrow.y * scaleY;

      // size масштабируем по X (viewBox по ширине 150)
      const realSize = arrow.size * scaleX;

      // Стрелка
      ctx.save();
      ctx.translate(realX + realSize / 2, realY + realSize / 2);
      ctx.rotate((arrow.rotation * Math.PI) / 180);

      const pathScale = realSize / 150; // viewBox width = 150
      ctx.scale(pathScale, pathScale);
      ctx.translate(-75, -45); // центр фигуры (75,45) в (0,0)

      const path = new Path2D('M50 0 L100 45 L70 45 L70 90 L30 90 L30 45 L0 45 Z');
      ctx.fillStyle = '#FF0000';
      ctx.strokeStyle = '#6D0000';
      ctx.lineWidth = 2.3 / pathScale;
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;

      ctx.fill(path);
      ctx.stroke(path);
      ctx.restore();

      // Текст под стрелкой
      if (arrow.text.trim()) {
        ctx.save();
        // Размер шрифта — из экранных ~20px, но в координатах исходника
        const fontSize = Math.max(20 * scaleX, 18);
        ctx.font = `bold ${Math.round(fontSize)}px Arial`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = Math.max(2 * scaleX, 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = realX + realSize / 2;
        const textY = realY + realSize * 1.25;

        ctx.strokeText(arrow.text, textX, textY);
        ctx.fillText(arrow.text, textX, textY);
        ctx.restore();
      }
    });

    offscreen.toBlob(
      (blob) => {
        if (blob) onConfirm(blob, instructions.join(', '));
      },
      'image/png',
      1
    );
  };

  // Модалка: блокируем скролл body
  useEffect(() => {
    setIsMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || 'auto';
    };
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col p-4 bg-black/80 backdrop-blur-sm">
      {/* Верхняя панель */}
      <div className="flex-shrink-0 mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <p className="text-slate-200 text-sm">Расставьте до 5 указателей с инструкциями</p>
          <button
            onClick={addArrow}
            disabled={arrows.length >= 5}
            className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 disabled:bg-gray-800 disabled:text-gray-500"
          >
            + Добавить стрелку ({arrows.length}/5)
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
          >
            Подтвердить
          </button>
        </div>
      </div>

      {/* Рабочая область */}
      <div
        className="flex-1 min-h-0 relative"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas ref={canvasRef} className="max-w-full max-h-full block" />
          {arrows.map((arrow) => (
            <div
              key={arrow.id}
              className="absolute touch-none"
              style={{
                left: arrow.x,
                top: arrow.y,
                width: arrow.size,
                height: arrow.size,
                border: selectedArrowId === arrow.id ? '2px dashed #06b6d4' : 'none',
                borderRadius: '4px',
                cursor: 'move',
                transform: `translate(-50%, -50%)`,
              }}
              onPointerDown={(e) => onPointerDown(e, arrow.id)}
            >
              <div style={{ width: arrow.size, height: arrow.size }}>
                <ArrowSvg rotation={arrow.rotation} />
                <textarea
                  value={arrow.text}
                  onChange={(e) => handleTextChange(arrow.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  placeholder="Инструкция..."
                  maxLength={TOKEN_LIMIT_CHARS}
                  className="absolute top-[105%] left-1/2 -translate-x-1/2 w-[120%] min-h-[40px] p-1 text-center bg-black/60 text-white text-xs rounded-md border border-cyan-500/50 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="flex-shrink-0 mt-2 h-16 flex items-center justify-center gap-6 bg-slate-900/50 p-2 rounded-lg">
        {selectedArrow ? (
          <>
            <label className="text-xs text-slate-300">
              Размер:{' '}
              <input
                type="range"
                min="30"
                max="300"
                value={selectedArrow.size}
                onChange={(e) => updateArrow(selectedArrow.id, { size: Number(e.target.value) })}
                className="w-32 accent-cyan-500"
              />
            </label>
            <label className="text-xs text-slate-300">
              Поворот:{' '}
              <input
                type="range"
                min="0"
                max="359"
                value={selectedArrow.rotation}
                onChange={(e) =>
                  updateArrow(selectedArrow.id, { rotation: Number(e.target.value) })
                }
                className="w-32 accent-cyan-500"
              />
            </label>
            <button
              onClick={deleteSelectedArrow}
              className="rounded bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Удалить
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-500">Выберите стрелку, чтобы изменить её</p>
        )}
      </div>
    </div>,
    document.body
  );
};

import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Vec2 = { x: number; y: number };

// SVG-иконка жирной красной стрелки (встроенная).
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

export const ArrowPointer: React.FC<{
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}> = ({ imageSrc, onConfirm, onCancel }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [arrowPos, setArrowPos] = useState<Vec2>({ x: 150, y: 150 });
  const [arrowSize, setArrowSize] = useState(100);
  const [arrowRotation, setArrowRotation] = useState(0);

  // Загружаем основное изображение
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => setImg(image);
  }, [imageSrc]);

  // Отрисовка: стабильная функция через useCallback
  const draw = useCallback(() => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Подгоняем CSS-размер под контейнер, но внутренний размер — нативный (качество)
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

    // Внутреннее разрешение = оригинал (чётко), CSS — под экран
    canvas.width = img.width;
    canvas.height = img.height;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [img]);

  // Первый рендер + resize на стабильную draw
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

  // Подтверждение — соберём PNG с отрисованной стрелкой на полном разрешении
  const handleConfirm = () => {
    if (!img) return;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return;

    // 1) Бэкграунд: исходник
    ctx.drawImage(img, 0, 0);

    // 2) Стрелка (с коррекцией смещения и масштаба)
    const canvas = canvasRef.current!;
    const parent = canvas.parentElement!;
    const canvasRect = canvas.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    // Вычисляем реальные отступы холста внутри родительского контейнера
    const offsetX = canvasRect.left - parentRect.left;
    const offsetY = canvasRect.top - parentRect.top;
    
    // Вычисляем масштабный коэффициент
    const scaleX = img.width / canvasRect.width;
    const scaleY = img.height / canvasRect.height;

    // Корректируем координаты: (экранная позиция - отступ) * масштаб
    const finalX = (arrowPos.x - offsetX) * scaleX;
    const finalY = (arrowPos.y - offsetY) * scaleY;

    ctx.save();
    // Центр стрелки в координатах исходника
    ctx.translate(finalX, finalY);
    ctx.rotate((arrowRotation * Math.PI) / 180);

    // viewBox 150x90 -> масштаб относительно ширины 150 (используем scaleX)
    // Вычисляем средний скейл, чтобы избежать искажения пропорций
    const avgScale = (scaleX + scaleY) / 2;

    // viewBox 150x90 -> масштаб относительно ширины 150
    const arrowRenderSize = arrowSize * avgScale;
    const pathScale = arrowRenderSize / 150;
    ctx.scale(pathScale, pathScale);

    // Центр фигуры (75,45) — в (0,0)
    ctx.translate(-75, -45);

    // Стили
    ctx.fillStyle = '#FF0000';
    ctx.strokeStyle = '#6D0000';
    ctx.lineWidth = 2.3 / pathScale; // толщину сохраняем визуально
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;

    // Рисуем path
    const path = new Path2D('M50 0 L100 45 L70 45 L70 90 L30 90 L30 45 L0 45 Z');
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore();

    offscreenCanvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      'image/png',
      1
    );
  };

  // Модалка: фиксируем скролл
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
      <div className="flex-shrink-0 mb-2 flex items-center justify-between gap-2">
        <p className="text-slate-200 text-sm">Перетащи стрелку, чтобы указать цель</p>
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

      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        <canvas ref={canvasRef} className="max-w-full max-h-full block" />
        <div
          className="absolute cursor-move touch-none"
          style={{
            left: arrowPos.x,
            top: arrowPos.y,
            width: arrowSize,
            height: arrowSize,
            transform: 'translate(-50%, -50%)',
          }}
          onPointerDown={(e) => {
            const el = e.currentTarget;
            el.setPointerCapture(e.pointerId);

            const onMove = (me: PointerEvent) => {
              setArrowPos((p) => ({ x: p.x + me.movementX, y: p.y + me.movementY }));
            };

            const onUp = () => {
              el.onpointermove = null;
              el.onpointerup = null;
              el.releasePointerCapture(e.pointerId);
            };

            el.onpointermove = onMove;
            el.onpointerup = onUp;
          }}
        >
          <ArrowSvg rotation={arrowRotation} />
        </div>
      </div>

      <div className="flex-shrink-0 mt-2 flex items-center justify-center gap-4 bg-slate-900/50 p-2 rounded-lg">
        <label className="text-xs text-slate-300">
          Размер:{' '}
          <input
            type="range"
            min="30"
            max="300"
            value={arrowSize}
            onChange={(e) => setArrowSize(Number(e.target.value))}
            className="accent-cyan-500"
          />
        </label>
        <label className="text-xs text-slate-300">
          Поворот:{' '}
          <input
            type="range"
            min="0"
            max="359"
            value={arrowRotation}
            onChange={(e) => setArrowRotation(Number(e.target.value))}
            className="accent-cyan-500"
          />
        </label>
      </div>
    </div>,
    document.body
  );
};
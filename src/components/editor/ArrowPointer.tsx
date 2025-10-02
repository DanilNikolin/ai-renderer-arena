// src/components/editor/ArrowPointer.tsx
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';

type Vec2 = { x: number; y: number };

// SVG-иконка жирной красной стрелки. Встроена прямо сюда, чтобы не было лишних файлов.
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

  // Отрисовка
  const draw = () => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Подгоняем размер canvas под изображение
    const parent = canvas.parentElement!;
    const parentRect = parent.getBoundingClientRect();
    const imgAspectRatio = img.width / img.height;
    const parentAspectRatio = parentRect.width / parentRect.height;

    let cssWidth, cssHeight; // Используем переменные для CSS размеров
    if (imgAspectRatio > parentAspectRatio) {
      cssWidth = parentRect.width;
      cssHeight = parentRect.width / imgAspectRatio;
    } else {
      cssHeight = parentRect.height;
      cssWidth = parentRect.height * imgAspectRatio;
    }

    // Задаем и внутренний размер (для качества), и CSS размер (для верстки)
    canvas.width = img.width; // <<< ЗАДАЕМ МАКСИМАЛЬНОЕ КАЧЕСТВО
    canvas.height = img.height;
    
    canvas.style.width = `${cssWidth}px`;   // <<< ЗАСТАВЛЯЕМ ВПИСАТЬСЯ В ЭКРАН
    canvas.style.height = `${cssHeight}px`; // <<< ЗАСТАВЛЯЕМ ВПИСАТЬСЯ В ЭКРАН

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  useLayoutEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [img]);
  
  // Клавиатура
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const handleConfirm = () => {
    if (!img) return;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;
    const ctx = offscreenCanvas.getContext('2d')!;

    // 1. Рисуем оригинал
    ctx.drawImage(img, 0, 0);

    // 2. Рисуем стрелку с ПРАВИЛЬНЫМ МАСШТАБИРОВАНИЕМ
    const canvas = canvasRef.current!;
    const scaleFactor = img.width / canvas.width;

    ctx.save();
    // Перемещаем начало координат в центр стрелки на исходном изображении
    ctx.translate(arrowPos.x * scaleFactor, arrowPos.y * scaleFactor);
    // Поворачиваем холст
    ctx.rotate(arrowRotation * Math.PI / 180);
    
    // <<< ВОТ КЛЮЧЕВОЙ ФИКС: МАСШТАБИРУЕМ САМ ХОЛСТ
    const arrowRenderSize = arrowSize * scaleFactor;
    // viewBox у твоей стрелки 150x90. Будем масштабировать относительно ширины 150.
    const pathScale = arrowRenderSize / 150; 
    ctx.scale(pathScale, pathScale);

    // Смещаем холст так, чтобы центр фигуры (75, 45) оказался в начале координат
    ctx.translate(-75, -45); 
    
    // Задаем стили
    ctx.fillStyle = '#FF0000';
    ctx.strokeStyle = '#6D0000';
    ctx.lineWidth = 2.3 / pathScale; // Компенсируем масштабирование для сохранения толщины линии
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    
    // Рисуем твою фигуру
    const path = new Path2D("M50 0 L100 45 L70 45 L70 90 L30 90 L30 45 L0 45 Z");
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore();

    offscreenCanvas.toBlob(blob => {
      if (blob) onConfirm(blob);
    }, 'image/png');
  };
  
  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col p-4 bg-black/80 backdrop-blur-sm">
      <div className="flex-shrink-0 mb-2 flex items-center justify-between gap-2">
        <p className="text-slate-200 text-sm">Перетащи стрелку, чтобы указать цель</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">Отмена</button>
          <button onClick={handleConfirm} className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400">Подтвердить</button>
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
          onPointerDown={e => {
            const el = e.currentTarget;
            el.setPointerCapture(e.pointerId);
            const onMove = (me: PointerEvent) => {
              setArrowPos(p => ({ x: p.x + me.movementX, y: p.y + me.movementY }));
            };
            el.onpointermove = onMove;
            el.onpointerup = () => el.onpointermove = null;
          }}
        >
          <ArrowSvg rotation={arrowRotation} />
        </div>
      </div>

      <div className="flex-shrink-0 mt-2 flex items-center justify-center gap-4 bg-slate-900/50 p-2 rounded-lg">
        <label className="text-xs text-slate-300">Размер: <input type="range" min="30" max="300" value={arrowSize} onChange={e => setArrowSize(Number(e.target.value))} className="accent-cyan-500" /></label>
        <label className="text-xs text-slate-300">Поворот: <input type="range" min="0" max="359" value={arrowRotation} onChange={e => setArrowRotation(Number(e.target.value))} className="accent-cyan-500" /></label>
      </div>
    </div>,
    document.body
  );
};
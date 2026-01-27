import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Vec2 = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

type DragMode = 'none' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-se' | 'resize-sw';

export type UniversalCropperProps = {
  imageSrc: string;
  aspectRatio: number;          // обязателен: width/height
  minWidth?: number;            // минимальная ширина рамки в CSS-пикселях
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
};

const HANDLE_SIZE_CSS = 12;
const HANDLE_HIT_CSS = 20;

const dpr = () => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const UniversalCropper: React.FC<UniversalCropperProps> = ({
  imageSrc,
  aspectRatio,
  minWidth = 120,
  onConfirm,
  onCancel,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // фон (fit) — масштаб и сдвиг
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgReady, setImgReady] = useState(false);
  const imgFitRef = useRef<{ scale: number; x: number; y: number; w: number; h: number }>({
    scale: 1, x: 0, y: 0, w: 0, h: 0
  });

  // рамка
  const selRef = useRef<Rect | null>(null);

  // drag state
  const dragRef = useRef<{
    mode: DragMode;
    start: Vec2;        // в backing px
    origSel: Rect;
  } | null>(null);

  // ===== загрузка изображения =====
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgRef.current = img; setImgReady(true); };
    img.onerror = () => { imgRef.current = null; setImgReady(false); alert('Failed to load image'); };
    img.src = imageSrc;
    return () => { imgRef.current = null; setImgReady(false); };
  }, [imageSrc]);

  // ===== утилиты =====
  const pointInRect = (p: Vec2, r: Rect) =>
    p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

  const getCanvasPoint = (e: PointerEvent | React.PointerEvent): Vec2 => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ratio = dpr();
    return { x: (e.clientX - rect.left) * ratio, y: (e.clientY - rect.top) * ratio };
  };

  const handleHit = (p: Vec2): DragMode => {
    const sel = selRef.current!;
    const ratio = dpr();
    const hs = HANDLE_HIT_CSS * ratio;
    const half = Math.round(hs / 2);

    const tests: { mode: DragMode; cx: number; cy: number }[] = [
      { mode: 'resize-nw', cx: sel.x, cy: sel.y },
      { mode: 'resize-ne', cx: sel.x + sel.w, cy: sel.y },
      { mode: 'resize-se', cx: sel.x + sel.w, cy: sel.y + sel.h },
      { mode: 'resize-sw', cx: sel.x, cy: sel.y + sel.h },
    ];

    for (const t of tests) {
      const r: Rect = { x: t.cx - half, y: t.cy - half, w: hs, h: hs };
      if (pointInRect(p, r)) return t.mode;
    }
    if (pointInRect(p, sel)) return 'move';
    return 'none';
  };

  const clampToImage = (r: Rect | null): Rect | null => {
    if (!r) return r;
    const fit = imgFitRef.current;
    let { x, y, w, h } = r;

    // не даём вылезти
    if (x < fit.x) x = fit.x;
    if (y < fit.y) y = fit.y;
    if (x + w > fit.x + fit.w) x = fit.x + fit.w - w;
    if (y + h > fit.y + fit.h) y = fit.y + fit.h - h;

    // если рамка больше изображения — ужмём
    if (w > fit.w) { w = fit.w; x = fit.x; h = Math.round(w / aspectRatio); }
    if (h > fit.h) { h = fit.h; y = fit.y; w = Math.round(h * aspectRatio); }

    // повторная подгонка на случай AR-сдвигов
    if (x < fit.x) x = fit.x;
    if (y < fit.y) y = fit.y;
    if (x + w > fit.x + fit.w) x = fit.x + fit.w - w;
    if (y + h > fit.y + fit.h) y = fit.y + fit.h - h;

    return { x, y, w, h };
  };

  // ===== ресайз canvas + fit-фото + первичная рамка =====
  const draw = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = dpr();
    const img = imgRef.current!;
    const fit = imgFitRef.current;
    const sel = selRef.current;

    // очистка
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // фон-фото (fit, статично)
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, img.width, img.height, fit.x, fit.y, fit.w, fit.h);

    if (!sel) return;

    // затемняем вне рамки
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.rect(sel.x, sel.y, sel.w, sel.h);
    ctx.fill('evenodd');
    ctx.restore();

    // обводка рамки
    ctx.save();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2 * ratio;
    ctx.setLineDash([6 * ratio, 4 * ratio]);
    ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
    ctx.setLineDash([]);

    // ручки (4 угла)
    const hs = HANDLE_SIZE_CSS * ratio;
    const half = Math.round(hs / 2);
    const corners: Vec2[] = [
      { x: sel.x, y: sel.y },
      { x: sel.x + sel.w, y: sel.y },
      { x: sel.x + sel.w, y: sel.y + sel.h },
      { x: sel.x, y: sel.y + sel.h },
    ];
    ctx.fillStyle = '#22d3ee';
    for (const c of corners) {
      ctx.fillRect(Math.round(c.x - half), Math.round(c.y - half), hs, hs);
    }
    ctx.restore();
  };

  const resizeAll = () => {
    const canvas = canvasRef.current!;
    const wrapper = wrapperRef.current!;
    const ratio = dpr();

    const rect = wrapper.getBoundingClientRect();
    // немного воздуха для кнопок
    const cssW = Math.max(320, rect.width);
    const cssH = Math.max(260, rect.height - 56);

    canvas.width = Math.round(cssW * ratio);
    canvas.height = Math.round(cssH * ratio);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const img = imgRef.current!;
    const s = Math.min(canvas.width / img.width, canvas.height / img.height);
    const iw = Math.round(img.width * s);
    const ih = Math.round(img.height * s);
    const ix = Math.round((canvas.width - iw) / 2);
    const iy = Math.round((canvas.height - ih) / 2);
    imgFitRef.current = { scale: s, x: ix, y: iy, w: iw, h: ih };

    // инициализируем рамку по центру (60% ширины fit-картинки)
    if (!selRef.current) {
      let w = Math.round(iw * 0.6);
      if (w < Math.round(minWidth * ratio)) w = Math.round(minWidth * ratio);
      let h = Math.round(w / aspectRatio);

      if (h > ih) {
        h = ih - Math.round(0.1 * ih);
        w = Math.round(h * aspectRatio);
      }
      const x = ix + Math.round((iw - w) / 2);
      const y = iy + Math.round((ih - h) / 2);
      selRef.current = { x, y, w, h };
    } else {
      selRef.current = clampToImage(selRef.current);
    }

    draw();
  };

  useLayoutEffect(() => {
    if (!imgReady) return;
    resizeAll();
    const onResize = () => { resizeAll(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgReady, aspectRatio, minWidth]);

  // ===== pointer handlers (React on* версии) =====
  const onPointerMoveCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sel = selRef.current;
    if (!sel) return;

    const p = getCanvasPoint(e);
    const canvas = canvasRef.current!;
    const ratio = dpr();

    if (!dragRef.current) {
      const m = handleHit(p);
      switch (m) {
        case 'move': canvas.style.cursor = 'move'; break;
        case 'resize-nw':
        case 'resize-se': canvas.style.cursor = 'nwse-resize'; break;
        case 'resize-ne':
        case 'resize-sw': canvas.style.cursor = 'nesw-resize'; break;
        default: canvas.style.cursor = 'default';
      }
      return;
    }

    const drag = dragRef.current!;
    const minW = Math.max(minWidth * ratio, 1);

    if (drag.mode === 'move') {
      const dx = p.x - drag.start.x;
      const dy = p.y - drag.start.y;
      const nx = drag.origSel.x + dx;
      const ny = drag.origSel.y + dy;
      selRef.current = clampToImage({ x: nx, y: ny, w: drag.origSel.w, h: drag.origSel.h });
      draw();
      return;
    }

    const signX = (drag.mode === 'resize-ne' || drag.mode === 'resize-se') ? 1 : -1;
    const signY = (drag.mode === 'resize-se' || drag.mode === 'resize-sw') ? 1 : -1;

    const dx = (p.x - drag.start.x) * signX;
    const dy = (p.y - drag.start.y) * signY;
    const base = Math.abs(dx) > Math.abs(dy) ? dx : dy;

    const w = Math.max(minW, drag.origSel.w + base * 2);
    const h = Math.round(w / aspectRatio);

    if (drag.mode === 'resize-nw') {
      const cx = drag.origSel.x + drag.origSel.w;
      const cy = drag.origSel.y + drag.origSel.h;
      const x = Math.round(cx - w);
      const y = Math.round(cy - h);
      selRef.current = clampToImage({ x, y, w, h });
    } else if (drag.mode === 'resize-ne') {
      const cx = drag.origSel.x;
      const cy = drag.origSel.y + drag.origSel.h;
      const x = Math.round(cx);
      const y = Math.round(cy - h);
      selRef.current = clampToImage({ x, y, w, h });
    } else if (drag.mode === 'resize-se') {
      const x = drag.origSel.x;
      const y = drag.origSel.y;
      selRef.current = clampToImage({ x, y, w, h });
    } else if (drag.mode === 'resize-sw') {
      const cx = drag.origSel.x + drag.origSel.w;
      const cy = drag.origSel.y;
      const x = Math.round(cx - w);
      const y = Math.round(cy);
      selRef.current = clampToImage({ x, y, w, h });
    }
    draw();
  };

  const onPointerDownCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selRef.current) return;
    (e.currentTarget as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
    const p = getCanvasPoint(e);
    const mode = handleHit(p);
    if (mode === 'none') return;
    dragRef.current = { mode, start: p, origSel: { ...selRef.current } };
  };

  const onPointerUpWindow = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'default';
    dragRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('pointerup', onPointerUpWindow);
    return () => window.removeEventListener('pointerup', onPointerUpWindow);
  }, []);

  const onWheelCanvas = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const sel = selRef.current;
    if (!sel) return;

    const p = getCanvasPoint(e as unknown as PointerEvent);
    const fit = imgFitRef.current;
    if (!pointInRect(p, { x: fit.x, y: fit.y, w: fit.w, h: fit.h })) return;

    const ratio = dpr();
    const minW = Math.max(minWidth * ratio, 1);

    const zoomFactor = Math.exp((-e.deltaY) * 0.0008);
    const w = Math.max(minW, Math.round(sel.w * zoomFactor));
    const h = Math.round(w / aspectRatio);

    const relX = (p.x - sel.x) / sel.w;
    const relY = (p.y - sel.y) / sel.h;
    const x = Math.round(p.x - relX * w);
    const y = Math.round(p.y - relY * h);

    selRef.current = clampToImage({ x, y, w, h });
    draw();
  };

  // ===== экспорт =====
  const handleConfirm = useCallback(() => {
    const img = imgRef.current!;
    const sel = selRef.current!;
    const fit = imgFitRef.current;

    // перевод из canvas/backing в пиксели оригинала
    const s = fit.scale;
    const sx = Math.round((sel.x - fit.x) / s);
    const sy = Math.round((sel.y - fit.y) / s);
    const sw = Math.round(sel.w / s);
    const sh = Math.round(sel.h / s);

    const csx = clamp(sx, 0, img.width);
    const csy = clamp(sy, 0, img.height);
    const csw = clamp(sw - (csx - sx), 1, img.width - csx);
    const csh = clamp(sh - (csy - sy), 1, img.height - csy);

    const out = document.createElement('canvas');
    out.width = csw;
    out.height = csh;
    const ctx = out.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, csx, csy, csw, csh, 0, 0, csw, csh);
    out.toBlob((b) => { if (b) onConfirm(b); }, 'image/png');
  }, [onConfirm]);

  // ===== клавиатура =====
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') handleConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, handleConfirm]);

  // ===== UI / Portal Logic =====
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Блокируем скролл фона, пока открыт кроппер
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const sizeText = useMemo(() => {
    const fit = imgFitRef.current;
    const sel = selRef.current;
    if (!sel || !fit.scale) return '';
    const w = Math.round(sel.w / fit.scale);
    const h = Math.round(sel.h / fit.scale);
    return `${w}×${h}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgReady]);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col p-4">
      {/* Фон — без перехвата событий */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden />

      {/* Интерактивный слой */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-slate-200 text-sm font-mono">
            AR: {aspectRatio.toFixed(3)} <span className="text-slate-500 mx-2">•</span> {sizeText}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
            >
              Cancel (Esc)
            </button>
            <button
              onClick={handleConfirm}
              className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 transition"
            >
              Confirm (Enter)
            </button>
          </div>
        </div>

        <div ref={wrapperRef} className="flex-1 min-h-[260px]">
          <div className="relative h-full w-full overflow-hidden rounded-md border border-slate-800 bg-slate-950/50">
            <canvas
              ref={canvasRef}
              className="block h-full w-full select-none"
              style={{ touchAction: 'none', pointerEvents: 'auto', cursor: 'default' }}
              onPointerDown={onPointerDownCanvas}
              onPointerMove={onPointerMoveCanvas}
              onWheel={onWheelCanvas}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

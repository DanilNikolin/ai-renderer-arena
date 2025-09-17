// src/components/workspace/Canvas.tsx

import React from "react";
import { cx } from "@/lib/utils";

// Пропсы для управления состоянием и отображением
interface CanvasProps {
  isLoading: boolean;
  resultUrl: string | null;
  sourceUrl: string | null;
  sourceFile: File | null;
  tab: "source" | "result" | "compare";
  setTab: (tab: "source" | "result" | "compare") => void;
  comparePos: number;
  setComparePos: (pos: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  isLoading,
  resultUrl,
  sourceUrl,
  sourceFile,
  tab,
  setTab,
  comparePos,
  setComparePos,
}) => {
  // Инкапсулируем логику скачивания прямо здесь
  const handleDownloadSource = () => {
    if (!sourceUrl || !sourceFile) return;
    const link = document.createElement("a");
    link.href = sourceUrl;
    link.download = sourceFile.name || "source.png";
    link.click();
  };

  const handleDownloadResult = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "result.png";
    link.click();
  };

  return (
    <section className="space-y-4">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {isLoading
            ? "Обработка…"
            : resultUrl
            ? "Готово"
            : "Ожидает запуска"}
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-1 flex">
            {(["source", "result", "compare"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cx(
                  "px-3 py-1.5 text-xs rounded-md",
                  tab === t
                    ? "bg-gray-800 text-gray-100"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                {t === "source"
                  ? "Исходник"
                  : t === "result"
                  ? "Результат"
                  : "Сравнить"}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadSource}
            disabled={!sourceUrl}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Скачать исходник
          </button>

          <button
            onClick={handleDownloadResult}
            disabled={!resultUrl}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Скачать результат
          </button>
        </div>
      </div>

      {/* canvases */}
      <div className="bg-gray-850 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
          {tab === "source"
            ? "Исходное изображение"
            : tab === "result"
            ? "Результат"
            : "Сравнение (двигай слайдер)"}
        </div>

        <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">
          {/* loading overlay */}
          {isLoading && (
            <div
              className="absolute inset-0 bg-gray-800/50 animate-pulse"
              aria-label="loading"
            />
          )}

          {/* source */}
          {tab !== "result" &&
            (sourceUrl ? (
              <img
                src={sourceUrl}
                alt="Source"
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                Загрузите изображение
              </div>
            ))}

          {/* result */}
          {tab !== "source" &&
            (resultUrl ? (
              tab === "compare" ? (
                <>
                  <img
                    src={resultUrl}
                    alt="Result"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none border-l-2 border-cyan-500"
                    style={{ left: `${comparePos}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={comparePos}
                    onChange={(e) => setComparePos(Number(e.target.value))}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[60%] h-2 bg-gray-700 rounded-lg appearance-none accent-cyan-500"
                  />
                </>
              ) : (
                <img
                  src={resultUrl}
                  alt="Result"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )
            ) : (
              tab !== "source" && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                  Пока пусто
                </div>
              )
            ))}
        </div>
      </div>

      <div className="text-[11px] text-gray-500">
        Лайфхак: короткий промпт → выбери модель → Ctrl/Cmd+Enter. Вставка из
        буфера работает.
      </div>
    </section>
  );
};
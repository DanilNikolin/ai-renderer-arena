// src/components/workspace/Sidebar.tsx

import React, { ChangeEvent, DragEvent, RefObject } from "react";
import { cx } from "@/lib/utils";
import {
  ACCEPTED_FILE_TYPES,
  FluxSettings,
  LlmSettings,
  MAX_FILE_SIZE_MB,
  Model,
  QwenSettings,
} from "@/lib/types";
import { Label, Slider } from "@/components/ui/FormControls";

// Определяем все пропсы, которые понадобятся этому компоненту
interface SidebarProps {
  imageInfo: { w: number; h: number } | null;
  sourceFile: File | null;
  dropRef: RefObject<HTMLLabelElement>;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showRefiner: boolean;
  setShowRefiner: (value: React.SetStateAction<boolean>) => void;
  rawPrompt: string;
  setRawPrompt: (value: string) => void;
  llmSettings: LlmSettings;
  handleLlmSettingsChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setLlmSettings: React.Dispatch<React.SetStateAction<LlmSettings>>;
  sendImageToLlm: boolean;
  setSendImageToLlm: (value: boolean) => void;
  onRefinePrompt: () => void;
  isRefining: boolean;
  refineError: string | null;
  prompt: string;
  setPrompt: (value: string) => void;
  showNeg: boolean;
  setShowNeg: (value: React.SetStateAction<boolean>) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
  seedLock: boolean;
  setSeedLock: (value: boolean) => void;
  randomizeSeed: () => void;
  qwenSettings: QwenSettings;
  handleQwenChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fluxSettings: FluxSettings;
  handleFluxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isReadyToGenerate: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onCancel: () => void;
  onClear: () => void;
  error: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  imageInfo,
  sourceFile,
  dropRef,
  onDrop,
  onFileChange,
  showRefiner,
  setShowRefiner,
  rawPrompt,
  setRawPrompt,
  llmSettings,
  handleLlmSettingsChange,
  setLlmSettings,
  sendImageToLlm,
  setSendImageToLlm,
  onRefinePrompt,
  isRefining,
  refineError,
  prompt,
  setPrompt,
  showNeg,
  setShowNeg,
  negativePrompt,
  setNegativePrompt,
  selectedModel,
  setSelectedModel,
  seedLock,
  setSeedLock,
  randomizeSeed,
  qwenSettings,
  handleQwenChange,
  fluxSettings,
  handleFluxChange,
  isReadyToGenerate,
  isLoading,
  onGenerate,
  onCancel,
  onClear,
  error,
}) => {
  return (
    <aside className="bg-gray-850 border border-gray-800 rounded-xl p-4 lg:p-5 sticky top-6 h-fit">
      {/* file */}
      <div className="space-y-2">
        <Label
          title="Исходное изображение"
          right={
            imageInfo && (
              <span className="text-[10px] text-gray-500">
                {imageInfo.w}×{imageInfo.h}px
              </span>
            )
          }
        />
        <label
          ref={dropRef}
          htmlFor="image-upload"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cx(
            "group border border-dashed rounded-lg p-4 text-center cursor-pointer transition",
            "border-gray-700 hover:border-cyan-500 bg-gray-900/50"
          )}
          title="Перетащи файл или кликни. Можно также вставить из буфера Ctrl+V."
        >
          {sourceFile ? (
            <div className="text-left space-y-1">
              <p className="text-cyan-400 text-sm font-medium truncate">
                {sourceFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(sourceFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {sourceFile.type.replace("image/", "").toUpperCase()}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-400">
                Перетащи или нажми, чтобы выбрать
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPEG, WebP • до {MAX_FILE_SIZE_MB}MB • Ctrl+V из буфера
              </p>
            </div>
          )}
          <input
            id="image-upload"
            type="file"
            className="hidden"
            accept={ACCEPTED_FILE_TYPES.join(",")}
            onChange={onFileChange}
          />
        </label>
      </div>

      {/* prompt refiner */}
      <div className="mt-5 space-y-3 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
        <button
          type="button"
          onClick={() => setShowRefiner((v) => !v)}
          className="w-full text-left text-sm font-medium text-cyan-400"
        >
          {showRefiner
            ? "▼ Скрыть «Промпт-Инженер»"
            : "► Открыть «Промпт-Инженер»"}
        </button>
        {showRefiner && (
          <div className="pt-2 space-y-4">
            <div>
              <Label title="1. Сообщение для LLM" />
              <textarea
                rows={3}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Опиши задачу простыми словами (напр.: стены кедр, лавки осина)"
                value={rawPrompt}
                onChange={(e) => setRawPrompt(e.target.value)}
              />
            </div>

            <div>
              <Label title="2. Системный промпт для LLM" />
              <textarea
                name="systemPrompt"
                rows={6}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={llmSettings.systemPrompt}
                onChange={handleLlmSettingsChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label title="Модель" />
                <div className="flex items-center gap-2 rounded-lg bg-gray-950 p-1">
                  {(["gpt-5-mini", "gpt-5-nano"] as const).map((model) => (
                    <button
                      key={model}
                      onClick={() =>
                        setLlmSettings((p) => ({ ...p, model }))
                      }
                      className={`w-full px-2 py-1 text-xs rounded-md transition-colors ${
                        llmSettings.model === model
                          ? "bg-cyan-600 text-white"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      {model.replace("gpt-5-", "GPT-5 ")}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex flex-col justify-end items-start gap-2 text-xs text-gray-400 cursor-pointer">
                <Label title="Контекст" />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendImageToLlm}
                    onChange={(e) => setSendImageToLlm(e.target.checked)}
                    className="accent-cyan-500"
                    disabled={!sourceFile}
                  />
                  Отправить картинку
                </div>
              </label>
            </div>

            <div className="pt-2 border-t border-gray-800 space-y-4">
              <Slider
                label="Temperature"
                name="temperature"
                value={llmSettings.temperature}
                min={0}
                max={2}
                step={0.1}
                onChange={handleLlmSettingsChange}
              />
              <Slider
                label="Top P"
                name="topP"
                value={llmSettings.topP}
                min={0}
                max={1}
                step={0.05}
                onChange={handleLlmSettingsChange}
              />
              <Slider
                label="Max Tokens"
                name="maxCompletionTokens"
                value={llmSettings.maxCompletionTokens}
                min={50}
                max={1000}
                step={10}
                onChange={handleLlmSettingsChange}
              />
            </div>

            <div className="text-center">
              <button
                onClick={onRefinePrompt}
                disabled={!rawPrompt.trim() || isRefining}
                className="w-full px-3 py-2 text-sm font-semibold rounded-md bg-cyan-700 hover:bg-cyan-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isRefining ? "Улучшаю..." : "✓ Улучшить и применить промпт"}
              </button>
            </div>

            {refineError && (
              <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded-md">
                {refineError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* prompt */}
      <div className="mt-5 space-y-2">
        <Label
          title="Инструкция"
          right={
            <span className="text-[10px] text-gray-500">
              {prompt.trim().length || 0}
            </span>
          }
        />
        <textarea
          rows={5}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Напр.: Change the walls to photorealistic Canadian cedar..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowNeg((v) => !v)}
          className="text-xs text-gray-400 hover:text-gray-200 transition underline underline-offset-4"
        >
          {showNeg ? "Скрыть негативный промпт" : "Показать негативный промпт"}
        </button>

        {showNeg && (
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Что НЕ нужно видеть"
          />
        )}
      </div>

      {/* model */}
      <div className="mt-5 space-y-2">
        <Label title="Модель" />
        <div className="grid grid-cols-3 gap-3">
          {(["flux", "qwen", "gemini"] as Model[]).map((m) => {
            const isActive = selectedModel === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={cx(
                  "py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200",
                  isActive
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600"
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* settings */}
      <div className="mt-5 pt-4 border-t border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-200">Параметры</h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[11px] text-gray-400">
              <input
                type="checkbox"
                checked={seedLock}
                onChange={(e) => setSeedLock(e.target.checked)}
                className="accent-cyan-500"
              />
              Фиксировать seed
            </label>
            <button
              type="button"
              onClick={randomizeSeed}
              className="text-[11px] px-2 py-1 rounded border border-gray-700 text-gray-300 hover:bg-gray-800"
              title="Случайный seed"
            >
              🎲
            </button>
          </div>
        </div>

        {selectedModel === "qwen" && (
          <>
            <Slider
              label="Guidance scale"
              value={qwenSettings.guidance_scale}
              min={1}
              max={10}
              step={0.1}
              onChange={handleQwenChange}
              name="guidance_scale"
            />
            <Slider
              label="Inference Steps"
              value={qwenSettings.num_inference_steps}
              min={10}
              max={60}
              step={1}
              onChange={handleQwenChange}
              name="num_inference_steps"
            />
            <Slider
              label="Seed"
              value={qwenSettings.seed}
              min={0}
              max={2147483647}
              step={1}
              onChange={handleQwenChange}
              name="seed"
            />
          </>
        )}

        {selectedModel === "flux" && (
          <>
            <Slider
              label="Guidance scale (CFG)"
              value={fluxSettings.guidance_scale}
              min={0}
              max={10}
              step={0.1}
              onChange={handleFluxChange}
              name="guidance_scale"
            />
            <Slider
              label="Safety Tolerance"
              value={fluxSettings.safety_tolerance}
              min={0}
              max={10}
              step={0.5}
              onChange={handleFluxChange}
              name="safety_tolerance"
              info="Большее — строже safety и потенциальный кроп."
            />
            <Slider
              label="Seed"
              value={fluxSettings.seed}
              min={0}
              max={2147483647}
              step={1}
              onChange={handleFluxChange}
              name="seed"
            />
          </>
        )}

        {selectedModel === "gemini" && (
          <p className="text-xs text-gray-500">
            Для Gemini пока нет доп. параметров.
          </p>
        )}
      </div>

      {/* actions */}
      <div className="mt-5 space-y-3">
        <button
          onClick={onGenerate}
          disabled={!isReadyToGenerate}
          className={cx(
            "w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition",
            isReadyToGenerate
              ? "bg-cyan-600 hover:bg-cyan-500 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
          title="Ctrl/Cmd+Enter — тоже сработает"
        >
          {isLoading ? "Генерация..." : "Сгенерировать"}
        </button>

        <div className="flex items-center justify-between">
          {isLoading ? (
            <button
              onClick={onCancel}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Отменить (Esc)
            </button>
          ) : (
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Очистить
            </button>
          )}
          {sourceFile && (
            <span className="text-[11px] text-gray-500">
              {sourceFile.type.replace("image/", "").toUpperCase()}
            </span>
          )}
        </div>

        {error && (
          <div className="text-red-300 text-xs bg-red-900/20 border border-red-800/40 rounded p-2">
            <p className="font-semibold">Ошибка</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </aside>
  );
};
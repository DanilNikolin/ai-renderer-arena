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
  SeedreamSettings,
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
  llmSettingsByModel: { [key in Model]?: Partial<LlmSettings> }; // <<< ИЗМЕНЕНО
  handleLlmSettingsChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
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
  seedreamSettings: SeedreamSettings;
  handleSeedreamChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isReadyToGenerate: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onCancel: () => void;
  onClear: () => void;
  error: string | null;
  jsonContent: string | null;
  isJsonViewerOpen: boolean;
  setIsJsonViewerOpen: (value: React.SetStateAction<boolean>) => void;
  jsonError: string | null;
  onJsonFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDetailingMode: boolean;
  promptTokenCount: number;
  negativeTokenCount: number;
  seedreamTargetSize: 1024 | 1280 | 'original';
  setSeedreamTargetSize: (size: 1024 | 1280 | 'original') => void;
  seedreamSizeWarning: string | null;
  windowView: string;
  setWindowView: (value: string) => void;
  doorView: string;
  setDoorView: (value: string) => void;
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
  llmSettingsByModel,
  handleLlmSettingsChange,
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
  seedreamSettings,
  handleSeedreamChange,
  isReadyToGenerate,
  isLoading,
  onGenerate,
  onCancel,
  onClear,
  error,
  jsonContent,
  isJsonViewerOpen,
  setIsJsonViewerOpen,
  jsonError,
  onJsonFileChange,
  isDetailingMode,
  promptTokenCount,
  negativeTokenCount,
  seedreamTargetSize,
  setSeedreamTargetSize,
  seedreamSizeWarning,
  windowView,
  setWindowView,
  doorView,
  setDoorView,
}) => {
  const activeLlmSettings = React.useMemo(() => {
    const defaults = {
      model: 'gpt-5-mini',
      systemPrompt: '',
      temperature: 1.0,
      topP: 1,
      maxCompletionTokens: 2000,
    };
    return { ...defaults, ...llmSettingsByModel[selectedModel] };
  }, [llmSettingsByModel, selectedModel]);

  return (
    <aside className="bg-gray-850 border border-gray-800 rounded-xl p-4 lg:p-5 sticky top-6 h-fit">
      {/* file */}
      <div className="space-y-2">
        <Label
          title={isDetailingMode ? "Изображение для доработки" : "Исходное изображение"}
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
      


      {/* JSON Viewer */}
      <div className="mt-5 space-y-3 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
        <button
          type="button"
          onClick={() => setIsJsonViewerOpen((v) => !v)}
          className="w-full text-left text-sm font-medium text-yellow-400"
        >
          {isJsonViewerOpen ? "▼ Скрыть JSON Viewer" : "► Открыть JSON Viewer"}
        </button>
        {isJsonViewerOpen && (
          <div className="pt-2 space-y-3">
            <label
              htmlFor="json-upload"
              className="block w-full text-center text-xs text-gray-400 border border-dashed border-gray-600 hover:border-yellow-500 rounded-md p-3 cursor-pointer"
            >
              Нажми, чтобы выбрать .json файл
              <input
                id="json-upload"
                type="file"
                className="hidden"
                accept="application/json"
                onChange={onJsonFileChange}
              />
            </label>

            {jsonError && (
              <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded-md">
                {jsonError}
              </p>
            )}

            {jsonContent && (
              <pre className="bg-gray-950 p-2 rounded-md text-xs text-gray-300 max-h-60 overflow-auto whitespace-pre-wrap">
                <code>{jsonContent}</code>
              </pre>
            )}
          </div>
        )}
      </div>

      {/* <<< НАЧАЛО ЗАМЕНЫ */}
      <div className="mt-5 space-y-4 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-200">Настройка окружения</h3>

          {(() => {
            // --- Шаблоны для ОКОН ---
            const windowTemplates = [
              { label: 'Лес летний', value: 'a lush green summer forest with sunbeams filtering through the leaves' },
              { label: 'Лес зимний', value: 'a quiet, snow-covered winter forest with tall pine trees' },
              { label: 'Горы (Альпы)', value: 'a majestic view of the snow-capped Alpine mountains under a clear blue sky' },
              { label: 'Двор летний', value: 'a neat suburban backyard in summer with a manicured green lawn and a wooden fence' },
              { label: 'Двор зимний', value: 'a suburban backyard in winter, covered in a fresh blanket of snow' },
            ];
            
            // --- Шаблоны для ДВЕРЕЙ ---
            const doorTemplates = [
              { label: 'Предбанник', value: 'a cozy antechamber (changing room) with wooden benches' },
              { label: 'Современный коридор', value: 'a modern, minimalist hallway with soft lighting' },
              { label: 'Раздевалка', value: 'a clean, bright locker room with wooden cabinets' },
              { label: 'Другая комната', value: 'another sauna room, slightly out of focus' },
            ];

            // --- Универсальный обработчик для обоих селекторов ---
            const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>, setter: (val: string) => void) => {
              const value = e.target.value;
              if (value) {
                setter(value);
              }
            };
            
            return (
              <>
                {/* Window View */}
                <div>
                  <Label title="Вид из окна" />
                  <div className="flex gap-2">
                    <select 
                      onChange={(e) => handleTemplateChange(e, setWindowView)}
                      className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Шаблоны...</option>
                      {windowTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input
                        type="text"
                        value={windowView}
                        onChange={(e) => setWindowView(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="... или впиши свой вариант"
                    />
                  </div>
                </div>

                {/* Door View */}
                <div>
                  <Label title="Вид за дверью" />
                  <div className="flex gap-2">
                    <select 
                      onChange={(e) => handleTemplateChange(e, setDoorView)}
                      className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Шаблоны...</option>
                      {doorTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input
                        type="text"
                        value={doorView}
                        onChange={(e) => setDoorView(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="... или впиши свой вариант"
                    />
                  </div>
                </div>
              </>
            )
          })()}
      </div>
      {/* <<< КОНЕЦ ЗАМЕНЫ */}
      
      {/* <<< ИЗМЕНЕНИЕ: Весь блок промпт-инженера теперь показывается по условию */}
      {!isDetailingMode && (
        <div
          className="mt-5 space-y-3 border border-gray-700/50 rounded-lg p-3"
          style={{ backgroundColor: "#221b25ff" }}
        >
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
                  value={activeLlmSettings.systemPrompt}
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
                        // Имитируем событие для нашего универсального хендлера
                        handleLlmSettingsChange({
                          target: { name: 'model', value: model },
                        } as any)
                      }
                        className={`w-full px-2 py-1 text-xs rounded-md transition-colors ${
                        activeLlmSettings.model === model
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
                  value={activeLlmSettings.temperature}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={handleLlmSettingsChange}
                />
                <Slider
                  label="Top P"
                  name="topP"
                  value={activeLlmSettings.topP}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={handleLlmSettingsChange}
                />
                <Slider
                  label="Max Tokens"
                  name="maxCompletionTokens"
                  value={activeLlmSettings.maxCompletionTokens}
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
      )}

      {/* prompt */}
      <div className="mt-5 space-y-2">
        <Label
          title={isDetailingMode ? "Опишите правку" : "Инструкция для генерации"}
          right={
            <span className="text-[10px] text-gray-500">
              Токены: {promptTokenCount}
            </span>
          }
        />
        <textarea
          rows={5}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder={isDetailingMode ? "Напр.: Add a white towel on the bench" : "Напр.: Change the walls to photorealistic Canadian cedar..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

         <button
          type="button"
          onClick={() => setShowNeg((v) => !v)}
          className="text-xs text-gray-400 hover:text-gray-200 transition underline underline-offset-4"
        >
          {showNeg ? "Скрыть негативный промпт" : `Показать негативный промпт (${negativeTokenCount} токенов)`}
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
        <div className="grid grid-cols-4 gap-2">
          {(["flux", "qwen", "seedream", "gemini"] as Model[]).map((m) => {
            const isActive = selectedModel === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={cx(
                  "py-2.5 rounded-lg text-xs font-bold uppercase transition-all duration-200",
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

        {selectedModel === "seedream" && (
          <>
            {/* <<< НАШ НОВЫЙ БЛОК УПРАВЛЕНИЯ РАЗМЕРОМ */}
            <div>
              <Label title="Размер вывода (длинная сторона)" />
              <div className="grid grid-cols-3 gap-2">
                {([1024, 1280, 'original'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSeedreamTargetSize(size)}
                    className={cx(
                      "py-2 rounded-md text-xs font-semibold",
                      seedreamTargetSize === size
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-900 text-gray-400 hover:bg-gray-800"
                    )}
                  >
                    {size === 'original' ? 'Оригинал' : `${size}px`}
                  </button>
                ))}
              </div>
            </div>
            {/* КОНЕЦ НОВОГО БЛОКА */}
            {seedreamSizeWarning && (
              <p className="text-[11px] text-yellow-300 bg-yellow-900/40 border border-yellow-800/50 p-2 rounded-md mt-2">
                {seedreamSizeWarning}
              </p>
            )}

            <Slider
              label="Seed"
              value={seedreamSettings.seed}
              min={0}
              max={2147483647}
              step={1}
              onChange={handleSeedreamChange}
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
          {isLoading ? "Генерация..." : isDetailingMode ? "Доработать" : "Сгенерировать"}
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
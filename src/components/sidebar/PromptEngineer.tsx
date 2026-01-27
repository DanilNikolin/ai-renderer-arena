// src/components/sidebar/PromptEngineer.tsx
import React, { ChangeEvent, DragEvent, useState } from "react";
import { Label, Slider } from "@/components/ui/FormControls";
import { LlmSettings, Model } from "@/lib/types";

interface PromptEngineerProps {
  showRefiner: boolean;
  setShowRefiner: (value: React.SetStateAction<boolean>) => void;
  rawPrompt: string;
  setRawPrompt: (value: string) => void;
  llmSettingsByModel: { [key in Model]?: Partial<LlmSettings> };
  selectedModel: Model;
  handleLlmSettingsChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  sendImageToLlm: boolean;
  setSendImageToLlm: (value: boolean) => void;
  sourceFile: File | null;
  onRefinePrompt: () => void;
  isRefining: boolean;
  refineError: string | null;
}

export const PromptEngineer: React.FC<PromptEngineerProps> = ({
  showRefiner,
  setShowRefiner,
  rawPrompt,
  setRawPrompt,
  llmSettingsByModel,
  selectedModel,
  handleLlmSettingsChange,
  sendImageToLlm,
  setSendImageToLlm,
  sourceFile,
  onRefinePrompt,
  isRefining,
  refineError,
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

  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        setRawPrompt(text);
      } catch (err) {
        console.error("Failed to read file", err);
      }
    }
  };

  return (
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
              className={`w-full bg-gray-900 border ${isDragging ? "border-cyan-500 bg-gray-800" : "border-gray-800"
                } rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors`}
              placeholder="Опиши задачу или перетащи текстовый файл..."
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
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
                    onClick={() => {
                      // Мы просто даем тайпскрипту более конкретную ложь вместо абстрактной.
                      // Этого достаточно, чтобы правило no-explicit-any заткнулось.
                      handleLlmSettingsChange({
                        target: { name: 'model', value: model },
                      } as unknown as ChangeEvent<HTMLInputElement>);
                    }}
                    className={`w-full px-2 py-1 text-xs rounded-md transition-colors ${activeLlmSettings.model === model
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
  );
};
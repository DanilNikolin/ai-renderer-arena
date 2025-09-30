// src/components/sidebar/ModelSettings.tsx
import React, { ChangeEvent } from 'react';
import { Model, QwenSettings, FluxSettings, SeedreamSettings } from '@/lib/types';
import { Label, Slider } from '@/components/ui/FormControls';
import { cx } from '@/lib/utils';

interface ModelSettingsProps {
  selectedModel: Model;
  seedLock: boolean;
  setSeedLock: (value: boolean) => void;
  randomizeSeed: () => void;
  qwenSettings: QwenSettings;
  handleQwenChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fluxSettings: FluxSettings;
  handleFluxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  seedreamSettings: SeedreamSettings;
  handleSeedreamChange: (e: ChangeEvent<HTMLInputElement>) => void;
  seedreamTargetSize: 1024 | 1280 | 'original';
  setSeedreamTargetSize: (size: 1024 | 1280 | 'original') => void;
  seedreamSizeWarning: string | null;
}

export const ModelSettings: React.FC<ModelSettingsProps> = ({
  selectedModel,
  seedLock,
  setSeedLock,
  randomizeSeed,
  qwenSettings,
  handleQwenChange,
  fluxSettings,
  handleFluxChange,
  seedreamSettings,
  handleSeedreamChange,
  seedreamTargetSize,
  setSeedreamTargetSize,
  seedreamSizeWarning,
}) => {
  return (
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
            value={qwenSettings?.guidance_scale ?? 4}
            min={1}
            max={10}
            step={0.1}
            onChange={handleQwenChange}
            name="guidance_scale"
          />
          <Slider
            label="Inference Steps"
            value={qwenSettings?.num_inference_steps ?? 30}
            min={10}
            max={60}
            step={1}
            onChange={handleQwenChange}
            name="num_inference_steps"
          />
          <Slider
            label="Seed"
            value={qwenSettings?.seed ?? 0}
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
            value={fluxSettings?.guidance_scale ?? 3.5}
            min={0}
            max={10}
            step={0.1}
            onChange={handleFluxChange}
            name="guidance_scale"
          />
          <Slider
            label="Safety Tolerance"
            value={fluxSettings?.safety_tolerance ?? 2}
            min={0}
            max={10}
            step={0.5}
            onChange={handleFluxChange}
            name="safety_tolerance"
            info="Большее — строже safety и потенциальный кроп."
          />
          <Slider
            label="Seed"
            value={fluxSettings?.seed ?? 0}
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
          {seedreamSizeWarning && (
            <p className="text-[11px] text-yellow-300 bg-yellow-900/40 border border-yellow-800/50 p-2 rounded-md mt-2">
              {seedreamSizeWarning}
            </p>
          )}

          <Slider
            label="Seed"
            value={seedreamSettings?.seed ?? 0}
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
  );
};
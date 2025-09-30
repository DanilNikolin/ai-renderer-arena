// src/components/sidebar/ModelSelector.tsx
import React from 'react';
import { cx } from '@/lib/utils';
import { Model } from '@/lib/types';

interface ModelSelectorProps {
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
}

const MODELS: Model[] = ["flux", "qwen", "seedream", "gemini"];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel }) => {
  return (
    <div className="mt-5 space-y-2">
      <h3 className="text-xs text-gray-300 mb-1.5">Модель</h3>
      <div className="grid grid-cols-4 gap-2">
        {MODELS.map((m) => {
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
  );
};
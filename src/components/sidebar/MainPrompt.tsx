// src/components/sidebar/MainPrompt.tsx
import React from 'react';
import { Label } from '@/components/ui/FormControls';

interface MainPromptProps {
  activeTab: 'BASE' | 'PRO';
  prompt: string;
  setPrompt: (value: string) => void;
  promptTokenCount: number;
  showNeg: boolean;
  setShowNeg: (value: React.SetStateAction<boolean>) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  negativeTokenCount: number;
}

export const MainPrompt: React.FC<MainPromptProps> = ({
  activeTab,
  prompt,
  setPrompt,
  promptTokenCount,
  showNeg,
  setShowNeg,
  negativePrompt,
  setNegativePrompt,
  negativeTokenCount,
}) => {
  return (
    <div className="mt-5 space-y-2">
      <Label
        title={activeTab === 'BASE' ? "Generation Instruction" : "Describe the edit"}
        right={
          <span className="text-[10px] text-gray-500">
            Tokens: {promptTokenCount}
          </span>
        }
      />
      <textarea
        rows={5}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder={activeTab === 'BASE' ? "Create a photorealistic sauna..." : "For example: make this wall out of dark stone"}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        type="button"
        onClick={() => setShowNeg((v) => !v)}
        className="text-xs text-gray-400 hover:text-gray-200 transition underline underline-offset-4"
      >
        {showNeg ? "Hide Negative Prompt" : `Show Negative Prompt (${negativeTokenCount} tokens)`}
      </button>

      {showNeg && (
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="What NOT to see"
        />
      )}
    </div>
  );
};
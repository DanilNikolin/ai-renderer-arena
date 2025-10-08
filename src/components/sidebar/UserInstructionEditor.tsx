// src/components/sidebar/UserInstructionEditor.tsx
import React from 'react';

import { MainPrompt } from './MainPrompt';
import { ActionButtons } from './ActionButtons';

// Используем только те пропсы, что реально нужны для этого урезанного компонента
type UserInstructionEditorProps = {
  prompt: string;
  setPrompt: (value: string) => void;
  promptTokenCount: number;
  showNeg: boolean;
  setShowNeg: (value: React.SetStateAction<boolean>) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  negativeTokenCount: number;
  isReadyToGenerate: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onCancel: () => void;
  onClear: () => void;
  error: string | null;
  sourceFile: File | null; // ActionButtons его использует для отображения типа файла
};

export const UserInstructionEditor: React.FC<UserInstructionEditorProps> = (props) => {
  return (
    <div className="space-y-5 pt-3">
      <MainPrompt
        activeTab={'PRO'} // Мы всегда в PRO-режиме здесь
        prompt={props.prompt}
        setPrompt={props.setPrompt}
        promptTokenCount={props.promptTokenCount}
        showNeg={props.showNeg}
        setShowNeg={props.setShowNeg}
        negativePrompt={props.negativePrompt}
        setNegativePrompt={props.setNegativePrompt}
        negativeTokenCount={props.negativeTokenCount}
      />

      {/* ModelSelector и ModelSettings здесь нет. Они захардкожены в хуке. */}

      <ActionButtons
        isReadyToGenerate={props.isReadyToGenerate}
        isLoading={props.isLoading}
        onGenerate={props.onGenerate}
        onCancel={props.onCancel}
        onClear={props.onClear}
        error={props.error}
        activeTab={'PRO'}
        sourceFile={props.sourceFile}
      />
    </div>
  );
};
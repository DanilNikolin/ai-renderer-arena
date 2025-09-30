// src/components/sidebar/InstructionEditor.tsx
import React from 'react';

import { MainPrompt } from './MainPrompt';
import { ModelSelector } from './ModelSelector';
import { ModelSettings } from './ModelSettings';
import { ActionButtons } from './ActionButtons';
import type { SidebarProps } from '../workspace/Sidebar.types';

// Мы берем часть пропсов из общего типа, чтобы не дублировать
type InstructionEditorProps = Pick<
  SidebarProps,
  | 'activeTab'
  | 'prompt'
  | 'setPrompt'
  | 'promptTokenCount'
  | 'showNeg'
  | 'setShowNeg'
  | 'negativePrompt'
  | 'setNegativePrompt'
  | 'negativeTokenCount'
  | 'selectedModel'
  | 'setSelectedModel'
  | 'seedLock'
  | 'setSeedLock'
  | 'randomizeSeed'
  | 'qwenSettings'
  | 'handleQwenChange'
  | 'fluxSettings'
  | 'handleFluxChange'
  | 'seedreamSettings'
  | 'handleSeedreamChange'
  | 'seedreamTargetSize'
  | 'setSeedreamTargetSize'
  | 'seedreamSizeWarning'
  | 'isReadyToGenerate'
  | 'isLoading'
  | 'onGenerate'
  | 'onCancel'
  | 'onClear'
  | 'error'
  | 'sourceFile'
>;

export const InstructionEditor: React.FC<InstructionEditorProps> = (props) => {
  return (
    <div className="space-y-5 pt-3">
      {/* Здесь мы просто переиспользуем те же самые компоненты,
        которые раньше были разбросаны по сайдбару.
        Теперь они живут вместе, как хорошая семья.
      */}
      <MainPrompt
        activeTab={props.activeTab}
        prompt={props.prompt}
        setPrompt={props.setPrompt}
        promptTokenCount={props.promptTokenCount}
        showNeg={props.showNeg}
        setShowNeg={props.setShowNeg}
        negativePrompt={props.negativePrompt}
        setNegativePrompt={props.setNegativePrompt}
        negativeTokenCount={props.negativeTokenCount}
      />

      <ModelSelector
        selectedModel={props.selectedModel}
        setSelectedModel={props.setSelectedModel}
      />

      <ModelSettings
        selectedModel={props.selectedModel}
        seedLock={props.seedLock}
        setSeedLock={props.setSeedLock}
        randomizeSeed={props.randomizeSeed}
        qwenSettings={props.qwenSettings}
        handleQwenChange={props.handleQwenChange}
        fluxSettings={props.fluxSettings}
        handleFluxChange={props.handleFluxChange}
        seedreamSettings={props.seedreamSettings}
        handleSeedreamChange={props.handleSeedreamChange}
        seedreamTargetSize={props.seedreamTargetSize}
        setSeedreamTargetSize={props.setSeedreamTargetSize}
        seedreamSizeWarning={props.seedreamSizeWarning}
      />

      <ActionButtons
        isReadyToGenerate={props.isReadyToGenerate}
        isLoading={props.isLoading}
        onGenerate={props.onGenerate}
        onCancel={props.onCancel}
        onClear={props.onClear}
        error={props.error}
        activeTab={props.activeTab}
        sourceFile={props.sourceFile}
      />
    </div>
  );
};
// src/components/workspace/Sidebar.tsx
import React from "react";
import type { SidebarProps } from "./Sidebar.types";
// <<< ИЗМЕНЕНО: Правильный путь, на один уровень выше
import { ModeSwitcher } from '../sidebar/ModeSwitcher';
import { FileUpload } from '../sidebar/FileUpload';
import { JsonViewer } from '../sidebar/JsonViewer';
import { EnvironmentSettings } from '../sidebar/EnvironmentSettings';
import { PromptEngineer } from '../sidebar/PromptEngineer';
import { ProTools } from '../sidebar/ProTools';
import { MainPrompt } from '../sidebar/MainPrompt';
import { ModelSelector } from '../sidebar/ModelSelector';
import { ModelSettings } from '../sidebar/ModelSettings';
import { ActionButtons } from '../sidebar/ActionButtons';

export const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <aside className="bg-gray-850 border border-gray-800 rounded-xl p-4 lg:p-5 sticky top-6 h-fit">

      <ModeSwitcher
        activeTab={props.activeTab}
        handleTabChange={props.handleTabChange}
      />

      {/* Контент для вкладки BASE */}
      {props.activeTab === 'BASE' && (
        <div className="space-y-5">
          <FileUpload
            imageInfo={props.imageInfo}
            sourceFile={props.sourceFile}
            dropRef={props.dropRef}
            onDrop={props.onDrop}
            onFileChange={props.onFileChange}
          />
          <JsonViewer
            isJsonViewerOpen={props.isJsonViewerOpen}
            setIsJsonViewerOpen={props.setIsJsonViewerOpen}
            onJsonFileChange={props.onJsonFileChange}
            jsonError={props.jsonError}
            jsonContent={props.jsonContent}
          />
          <EnvironmentSettings
            windowView={props.windowView}
            setWindowView={props.setWindowView}
            doorView={props.doorView}
            setDoorView={props.setDoorView}
          />
          <PromptEngineer
            showRefiner={props.showRefiner}
            setShowRefiner={props.setShowRefiner}
            rawPrompt={props.rawPrompt}
            setRawPrompt={props.setRawPrompt}
            llmSettingsByModel={props.llmSettingsByModel}
            selectedModel={props.selectedModel}
            handleLlmSettingsChange={props.handleLlmSettingsChange}
            sendImageToLlm={props.sendImageToLlm}
            setSendImageToLlm={props.setSendImageToLlm}
            sourceFile={props.sourceFile}
            onRefinePrompt={props.onRefinePrompt}
            isRefining={props.isRefining}
            refineError={props.refineError}
          />
        </div>
      )}

      {/* Контент для вкладки PRO */}
      {props.activeTab === 'PRO' && (
        <ProTools
          activeHistory={props.activeHistory}
          handleChangeSource={props.handleChangeSource}
        />
      )}

      {/* Общие блоки для обоих режимов */}
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

    </aside>
  );
};
// src/components/sidebar/UserProTools.tsx
import React, { useState, useEffect } from 'react';
import type { useUserImageWorkspace } from '@/hooks/useUserImageWorkspace';
import Image from 'next/image';

// Импортируем все наши инструменты
import { UserInstructionEditor } from './UserInstructionEditor';
import { TextureTransplanter } from './TextureTransplanter';
import { BackgroundReplacer } from './BackgroundReplacer';
import { StyleTransplanter } from './StyleTransplanter';
import { ObjectInjector } from './ObjectInjector';
import { ObjectInjector3D } from './ObjectInjector3D';
import { MultiArrowEditor } from '../editor/MultiArrowEditor';
import { Label } from '../ui/FormControls';

type UserProToolsProps = ReturnType<typeof useUserImageWorkspace>;

export const UserProTools: React.FC<UserProToolsProps> = (props) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBgReplacerOpen, setIsBgReplacerOpen] = useState(false);
  const [isTextureTransplanterOpen, setIsTextureTransplanterOpen] = useState(false);
  const [isStyleTransplanterOpen, setIsStyleTransplanterOpen] = useState(false);
  const [isObjectInjectorOpen, setIsObjectInjectorOpen] = useState(false);
  const [isObjectInjector3DOpen, setIsObjectInjector3DOpen] = useState(false);
  const [isArrowSectionOpen, setIsArrowSectionOpen] = useState(false);

  const [isArrowEditorOpen, setIsArrowEditorOpen] = useState(false);
  const [arrowMapBlob, setArrowMapBlob] = useState<Blob | null>(null);
  const [arrowMapPreviewUrl, setArrowMapPreviewUrl] = useState<string | null>(null);
  const [arrowInstructions, setArrowInstructions] = useState<string>('');

  const sourceAspectRatio = props.activeNodeDims
    ? props.activeNodeDims.w / props.activeNodeDims.h
    : props.imageInfo
      ? props.imageInfo.w / props.imageInfo.h
      : 16 / 9;

  useEffect(() => {
    return () => {
      if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
    };
  }, [arrowMapPreviewUrl]);

  const handleArrowEditorConfirm = (imageBlob: Blob, instructionsText: string) => {
    setArrowMapBlob(imageBlob);
    setArrowInstructions(instructionsText);
    if (arrowMapPreviewUrl) URL.revokeObjectURL(arrowMapPreviewUrl);
    setArrowMapPreviewUrl(URL.createObjectURL(imageBlob));
    setIsArrowEditorOpen(false);
  };

  const handleSendArrowEdits = () => {
    if (!arrowMapBlob || !arrowInstructions.trim()) return;
    props.onGenerateArrowEdits(arrowMapBlob, arrowInstructions);
  };

  return (
    <div className="space-y-3">
      {props.activeHistory.length > 0 && (
        <div className="mb-2">
          <button
            onClick={props.handleChangeSource}
            className="w-full text-center text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-800/50 bg-yellow-900/20 rounded-md py-2 transition"
          >
            ↩︎ Change Source
          </button>
        </div>
      )}

      <h3 className="text-sm font-semibold text-gray-200">Workshop (PRO)</h3>

      <div className="space-y-2">
        {/* Правка по инструкции (Qwen) */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button onClick={() => setIsEditorOpen((v) => !v)} className="w-full text-left text-sm font-medium text-cyan-400 p-3">
            {isEditorOpen ? '▼' : '►'} Instruction Editing
          </button>
          {isEditorOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <UserInstructionEditor
                prompt={props.prompt}
                setPrompt={props.setPrompt}
                promptTokenCount={props.promptTokenCount}
                showNeg={props.showNeg}
                setShowNeg={props.setShowNeg}
                negativePrompt={props.negativePrompt}
                setNegativePrompt={props.setNegativePrompt}
                negativeTokenCount={props.negativeTokenCount}
                isReadyToGenerate={props.isReadyToGeneratePro}
                isLoading={props.isLoading}
                onGenerate={props.onGeneratePro}
                onCancel={props.onCancel}
                onClear={props.onClearPro}
                error={props.error}
                sourceFile={props.activeNode ? new File([], "pro_mode") : null}
              />
            </div>
          )}
        </div>

        {/* Замена Фона (Nano Banana) */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button onClick={() => setIsBgReplacerOpen((v) => !v)} className="w-full text-left text-sm font-medium text-cyan-400 p-3">
            {isBgReplacerOpen ? '▼' : '►'} Background Replacement
          </button>
          {isBgReplacerOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <BackgroundReplacer
                onGenerate={props.onGenerateBackgroundReplacement}
                isLoading={props.isLoading}
                sourceAspectRatio={sourceAspectRatio}
                hideModelSelector={true}
                helperPrompt={props.helperPrompts.background}
                onHelperPromptChange={(val) => props.setHelperPrompts(p => ({ ...p, background: val }))}
              />
            </div>
          )}
        </div>

        {/* Замена Текстуры (Nano Banana) */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button onClick={() => setIsTextureTransplanterOpen(v => !v)} className="w-full text-left text-sm font-medium text-cyan-400 p-3">
            {isTextureTransplanterOpen ? '▼' : '►'} Texture Replacement
          </button>
          {isTextureTransplanterOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <TextureTransplanter
                onGenerate={props.onGenerateTextureReplacement}
                isLoading={props.isLoading}
                activeImageUrl={props.activeNode?.imageUrl ?? null}
                sourceAspectRatio={sourceAspectRatio}
                hideModelSelector={true}
                helperPrompt={props.helperPrompts.texture}
                onHelperPromptChange={(val) => props.setHelperPrompts(p => ({ ...p, texture: val }))}
              />
            </div>
          )}
        </div>

        {/* Замена Стиля (Nano Banana) */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button onClick={() => setIsStyleTransplanterOpen(v => !v)} className="w-full text-left text-sm font-medium text-cyan-400 p-3">
            {isStyleTransplanterOpen ? '▼' : '►'} Style Replacement
          </button>
          {isStyleTransplanterOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <StyleTransplanter
                onGenerate={props.onGenerateStyleReplacement}
                isLoading={props.isLoading}
                sourceAspectRatio={sourceAspectRatio}
                hideModelSelector={true}
                helperPrompt={props.helperPrompts.style}
                onHelperPromptChange={(val) => props.setHelperPrompts(p => ({ ...p, style: val }))}
              />
            </div>
          )}
        </div>

        {/* Внедрение Объекта 2D (Nano Banana) */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button onClick={() => setIsObjectInjectorOpen(v => !v)} className="w-full text-left text-sm font-medium text-cyan-400 p-3">
            {isObjectInjectorOpen ? '▼' : '►'} Object Injection (2D)
          </button>
          {isObjectInjectorOpen && (
            <div className="p-3 border-t border-gray-700/50">
              <ObjectInjector
                onGenerate={props.onGenerateObjectInjection}
                isLoading={props.isLoading}
                activeImageUrl={props.activeNode?.imageUrl ?? null}
                sourceAspectRatio={sourceAspectRatio}
                hideModelSelector={true}
                helperPrompt={props.helperPrompts.object}
                onHelperPromptChange={(val) => props.setHelperPrompts(p => ({ ...p, object: val }))}
              />
            </div>
          )}
        </div>

        {/* Интеграция Объекта 3D (Nano Banana) */}
        <div className="bg-gray-900/50 border border-purple-800/50 rounded-lg">
          <button onClick={() => setIsObjectInjector3DOpen((v) => !v)} className="w-full text-left text-sm font-medium text-purple-400 p-3">
            {isObjectInjector3DOpen ? '▼' : '►'} Object Integration (3D)
          </button>
          {isObjectInjector3DOpen && (
            <div className="p-3 border-t border-purple-800/50">
              <ObjectInjector3D
                saunaImageUrl={props.activeNode?.imageUrl ?? null}
                onGenerate={props.onGenerateObjectInjection3D}
              />
            </div>
          )}
        </div>

        {/* Редактор по Стрелкам (SeeDream) */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          <button onClick={() => setIsArrowSectionOpen((v) => !v)} className="w-full text-left text-sm font-medium text-cyan-400 p-3">
            {isArrowSectionOpen ? '▼' : '►'} Arrow Editor
          </button>
          {isArrowSectionOpen && (
            <div className="p-3 border-t border-gray-700/50 space-y-3">
              {arrowMapPreviewUrl ? (
                <div className="space-y-3">
                  <div>
                    <Label title="Instruction Map (Preview)" />
                    <div className="relative h-24 w-full rounded-lg border border-cyan-700 bg-gray-950 overflow-hidden">
                      <Image src={arrowMapPreviewUrl} alt="Arrow map preview" fill sizes="150px" className="object-contain" />
                      <button onClick={() => setArrowMapBlob(null)} className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-700/80 hover:bg-red-600 text-white rounded-full transition" title="Change/Remove Map">✕</button>
                    </div>
                  </div>
                  <button onClick={handleSendArrowEdits} className="w-full text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md py-2.5">
                    Apply Edits
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsArrowEditorOpen(true)} disabled={!props.activeNode} className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-cyan-800 hover:bg-cyan-700 transition disabled:bg-gray-800 disabled:text-gray-500">
                  ✍️ Open Editor
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isArrowEditorOpen && props.activeNode && (
        <MultiArrowEditor
          imageSrc={props.activeNode.imageUrl}
          onCancel={() => setIsArrowEditorOpen(false)}
          onConfirm={handleArrowEditorConfirm}
        />
      )}
    </div>
  );
};
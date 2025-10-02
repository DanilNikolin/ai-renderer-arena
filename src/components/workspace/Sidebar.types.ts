// src/components/workspace/Sidebar.types.ts
import { ChangeEvent, DragEvent, RefObject } from "react";
import {
  FluxSettings,
  LlmSettings,
  Model,
  GenerationNode,
  QwenSettings,
  SeedreamSettings,
} from "@/lib/types";

// Да, он все еще большой, но теперь он живет отдельно и не мозолит глаза.
export interface SidebarProps {
  activeTab: 'BASE' | 'PRO';
  handleTabChange: (tab: 'BASE' | 'PRO') => void;
  handleChangeSource: () => void;
  activeHistory: GenerationNode[];
  imageInfo: { w: number; h: number } | null;
  sourceFile: File | null;
  dropRef: RefObject<HTMLLabelElement | null>;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showRefiner: boolean;
  setShowRefiner: (value: React.SetStateAction<boolean>) => void;
  rawPrompt: string;
  setRawPrompt: (value: string) => void;
  llmSettingsByModel: { [key in Model]?: Partial<LlmSettings> };
  handleLlmSettingsChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  onGenerateBackgroundReplacement: (file: File, targets: { window: boolean; door: boolean }, model: 'gemini' | 'seedream') => void;
  onGenerateTextureReplacement: (targetMapFile: File, textureFile: File, model: 'gemini' | 'seedream') => void;
  onCancel: () => void;
  onClear: () => void;
  error: string | null;
  jsonContent: string | null;
  isJsonViewerOpen: boolean;
  setIsJsonViewerOpen: (value: React.SetStateAction<boolean>) => void;
  jsonError: string | null;
  onJsonFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  promptTokenCount: number;
  negativeTokenCount: number;
  seedreamTargetSize: 1024 | 1280 | 'original';
  setSeedreamTargetSize: (size: 1024 | 1280 | 'original') => void;
  seedreamSizeWarning: string | null;
  windowView: string;
  setWindowView: (value: string) => void;
  doorView: string;
  setDoorView: (value: string) => void;
  sourceAspectRatio: number;
  activeNode: GenerationNode | null;
}
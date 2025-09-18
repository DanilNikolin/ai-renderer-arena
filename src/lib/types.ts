// src/lib/types.ts

export type Model = "gemini" | "qwen" | "flux" | "seedream";

export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export type QwenSettings = { guidance_scale: number; num_inference_steps: number; seed: number };
export type FluxSettings = { guidance_scale: number; safety_tolerance: number; seed: number };
export type SeedreamSettings = { 
  seed: number; 
  width: number; 
  height: number; 
};
export type LlmModel = 'gpt-5-mini' | 'gpt-5-nano';

export type LlmSettings = {
  model: LlmModel;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxCompletionTokens: number;
};

export type PersistState = {
  prompt: string;
  negativePrompt: string;
  selectedModel: Model;
  qwenSettings: QwenSettings;
  fluxSettings: FluxSettings;
  seedreamSettings: SeedreamSettings;
  llmSettingsByModel: { [key in Model]?: Partial<LlmSettings> };
  sendImageToLlm: boolean;
  showRefiner: boolean;
  showNeg: boolean;
  seedLock: boolean;
  tab: "source" | "result" | "compare";
  comparePos: number;
};
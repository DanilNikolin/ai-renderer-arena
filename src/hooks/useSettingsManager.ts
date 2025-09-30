// src/hooks/useSettingsManager.ts
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Model, QwenSettings, FluxSettings, SeedreamSettings } from '@/lib/types';

export function useSettingsManager(imageInfo: { w: number; h: number } | null) {
  const [selectedModel, setSelectedModel] = useState<Model>("qwen");
  const [seedLock, setSeedLock] = useState(false);
  const [qwenSettings, setQwenSettings] = useState<QwenSettings>({ guidance_scale: 4, num_inference_steps: 30, seed: 0 });
  const [fluxSettings, setFluxSettings] = useState<FluxSettings>({ guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });
  const [seedreamSettings, setSeedreamSettings] = useState<SeedreamSettings>({ seed: 0, width: 1024, height: 1024 });
  const [seedreamTargetSize, setSeedreamTargetSize] = useState<1024 | 1280 | 'original'>('original');
  const [seedreamSizeWarning, setSeedreamSizeWarning] = useState<string | null>(null);

  useEffect(() => {
    if (selectedModel !== 'seedream' || !imageInfo || seedreamTargetSize === 'original') {
      setSeedreamSizeWarning(null);
      return;
    }
    const { w: originalWidth, h: originalHeight } = imageInfo;
    const ratio = originalWidth / originalHeight;
    let targetWidth, targetHeight;
    if (originalWidth >= originalHeight) {
      targetWidth = seedreamTargetSize;
      targetHeight = Math.round(targetWidth / ratio);
    } else {
      targetHeight = seedreamTargetSize;
      targetWidth = Math.round(targetHeight * ratio);
    }
    if (targetWidth < 1024 || targetHeight < 1024) {
      const minSide = Math.min(targetWidth, targetHeight);
      const scaleFactor = 1024 / minSide;
      const finalWidth = Math.round(targetWidth * scaleFactor);
      const finalHeight = Math.round(targetHeight * scaleFactor);
      setSeedreamSizeWarning(`Внимание: Результат будет увеличен до ${finalWidth}x${finalHeight}px.`);
    } else {
      setSeedreamSizeWarning(null);
    }
  }, [selectedModel, imageInfo, seedreamTargetSize]);

  const handleQwenChange = (e: ChangeEvent<HTMLInputElement>) => setQwenSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  const handleFluxChange = (e: ChangeEvent<HTMLInputElement>) => setFluxSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  const handleSeedreamChange = (e: ChangeEvent<HTMLInputElement>) => setSeedreamSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));

  const randomizeSeed = useCallback(() => {
    const seed = Math.floor(Math.random() * 2_147_483_647);
    if (selectedModel === "flux") setFluxSettings((p) => ({ ...p, seed }));
    if (selectedModel === "qwen") setQwenSettings((p) => ({ ...p, seed }));
    if (selectedModel === "seedream") setSeedreamSettings((p) => ({ ...p, seed }));
  }, [selectedModel]);

  const updateSeedForGeneration = useCallback(() => {
    if (seedLock) return;
    const seed = Math.floor(Math.random() * 2_147_483_647);
    if (selectedModel === "qwen") setQwenSettings(p => ({ ...p, seed }));
    if (selectedModel === "seedream") setSeedreamSettings(p => ({ ...p, seed }));
    if (selectedModel === "flux") setFluxSettings(p => ({ ...p, seed }));
  }, [seedLock, selectedModel]);
  
  const getCurrentSettings = useCallback((overrideModel?: Model) => {
    const modelToUse = overrideModel || selectedModel; // Используем переданную модель или глобальную
    switch (modelToUse) {
      case "qwen": return qwenSettings;
      case "flux": return fluxSettings;
      case "gemini": return { seed: qwenSettings.seed }; // Для Nano Banana нужен только seed
      case "seedream": {
        const origW = imageInfo?.w ?? 1024;
        const origH = imageInfo?.h ?? 1024;
        const ratio = origW / origH;
        let targetWidth = origW, targetHeight = origH;
        if (seedreamTargetSize !== 'original') {
          const targetSide = seedreamTargetSize;
          if (origW >= origH) {
            targetWidth = targetSide;
            targetHeight = Math.round(targetSide / ratio);
          } else {
            targetHeight = targetSide;
            targetWidth = Math.round(targetSide * ratio);
          }
        }
        if (targetWidth < 1024 || targetHeight < 1024) {
          const minSide = Math.min(targetWidth, targetHeight);
          const scaleFactor = 1024 / minSide;
          targetWidth = Math.round(targetWidth * scaleFactor);
          targetHeight = Math.round(targetHeight * scaleFactor);
        }
        return { ...seedreamSettings, width: targetWidth, height: targetHeight };
      }
      default: return fluxSettings;
    }
  }, [selectedModel, qwenSettings, seedreamSettings, fluxSettings, imageInfo, seedreamTargetSize]);

  return {
    selectedModel, setSelectedModel,
    seedLock, setSeedLock,
    qwenSettings, handleQwenChange,
    fluxSettings, handleFluxChange,
    seedreamSettings, handleSeedreamChange,
    seedreamTargetSize, setSeedreamTargetSize,
    seedreamSizeWarning,
    randomizeSeed,
    updateSeedForGeneration,
    getCurrentSettings,
    setQwenSettings,
    setFluxSettings,
    setSeedreamSettings,
  };
}
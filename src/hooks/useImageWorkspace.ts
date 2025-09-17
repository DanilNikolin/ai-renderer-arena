// src/hooks/useImageWorkspace.ts

import { useState, useMemo, useEffect, useRef, ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { FluxSettings, LlmSettings, Model, QwenSettings } from "@/lib/types";
import { loadPersist, readImageDims, savePersist } from "@/lib/utils";

const initialLlmSettings: LlmSettings = {
  model: 'gpt-5-mini',
  systemPrompt: `Ты — специализированный AI-ассистент «Промт-Инженер» для проекта AI-Рендерер.
Твоя задача — анализировать входные данные (изображение сауны и список материалов) и собирать короткий, структурированный промт для модели редактуры изображений (например, Qwen-Image-Edit).

Алгоритм:

Фильтрация материалов
Используй только материалы объектов, реально видимых на рендере.
Игнорируй лишние строки и невидимые элементы.

Геометрия
Всегда добавляй:
«Сохрани точную геометрию, пропорции, ракурс и FOV сцены; ничего не перемещать и не добавлять.»

Материалы
Замени все исходные заглушки на фотореалистичные материалы.
Опиши их просто и понятно: дерево с вариацией оттенков, сучками, дефектами; абаши с матовой отделкой; плитка со швами; металл печи матовый; камни шероховатые.
Не используй перегруженные термины вроде albedo, normal, AO. Пиши: «детализированные PBR-текстуры».

Особые условия (⚡)
Если есть чёрные пустые области, всегда указывай их замену в формате:
⚡ Чёрная стена = панорамное окно с видом на заснеженный скандинавский лес днём, мягкий дневной свет заходит внутрь.
⚡ Чёрный дверной проём = предбанник: светлый минималистичный интерьер, отделанный тем же деревом, что и стены сауны.
👉 Никогда не используй слово «сгенерируй» — только строгую форму «=».

Свет
Всегда добавляй: «Свет тёплый, мягкий, с физически корректными тенями; при наличии окна добавить холодный дневной свет для контрастности.»

Длина
Итоговый промт должен быть короче, в пределах 5–7 предложений.
Не превращай текст в «войну и мир» — главные акценты: геометрия, материалы, окно, дверь, свет.'.`,
  temperature: 1.0,
  topP: 1,
  maxCompletionTokens: 2000,
};

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function useImageWorkspace() {
  // --- Состояния (State) ---
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [rawPrompt, setRawPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [sendImageToLlm, setSendImageToLlm] = useState(true);
  const [showRefiner, setShowRefiner] = useState(false);
  const [llmSettings, setLlmSettings] = useState<LlmSettings>(initialLlmSettings);
  const [negativePrompt, setNegativePrompt] = useState("blurry, ugly, deformed, text, watermark");
  const [showNeg, setShowNeg] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ w: number; h: number } | null>(null);
  const [tab, setTab] = useState<"source" | "result" | "compare">("source");
  const [comparePos, setComparePos] = useState(50);
  const [seedLock, setSeedLock] = useState(false);
  const [qwenSettings, setQwenSettings] = useState<QwenSettings>({ guidance_scale: 4, num_inference_steps: 30, seed: 0 });
  const [fluxSettings, setFluxSettings] = useState<FluxSettings>({ guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });

  const abortControllerRef = useRef<AbortController | null>(null);
  const dropRef = useRef<HTMLLabelElement | null>(null);

  // --- Эффекты (Effects) ---

  // Загрузка состояния из localStorage при первом рендере
  useEffect(() => {
    const p = loadPersist();
    if (!p) return;

    setPrompt(p.prompt ?? "");
    setNegativePrompt(p.negativePrompt ?? "blurry, ugly, deformed, text, watermark");
    setSelectedModel(p.selectedModel ?? "flux");
    setQwenSettings(p.qwenSettings ?? { guidance_scale: 4, num_inference_steps: 30, seed: 0 });
    setFluxSettings(p.fluxSettings ?? { guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });
    if (p.llmSettings) setLlmSettings(p.llmSettings);
    if (typeof p.sendImageToLlm === "boolean") setSendImageToLlm(p.sendImageToLlm);
    if (typeof p.showRefiner === "boolean") setShowRefiner(p.showRefiner);
    if (typeof p.showNeg === "boolean") setShowNeg(p.showNeg);
    if (typeof p.seedLock === "boolean") setSeedLock(p.seedLock);
    if (p.tab) setTab(p.tab);
    if (typeof p.comparePos === "number") setComparePos(p.comparePos);
  }, []);

  // Сохранение состояния в localStorage при изменении
  useEffect(() => {
    savePersist({
      prompt,
      negativePrompt,
      selectedModel,
      qwenSettings,
      fluxSettings,
      llmSettings,
      sendImageToLlm,
      showRefiner,
      showNeg,
      seedLock,
      tab,
      comparePos,
    });
  }, [
    prompt,
    negativePrompt,
    selectedModel,
    qwenSettings,
    fluxSettings,
    llmSettings,
    sendImageToLlm,
    showRefiner,
    showNeg,
    seedLock,
    tab,
    comparePos,
  ]);
  
  // Очистка Object URL при размонтировании
  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);
  
  // Обработчик вставки из буфера обмена
  useEffect(() => {
    const handler = (ev: ClipboardEvent) => onPaste(ev);
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, []); // Зависимости пустые, т.к. onPaste определена внутри хука


  // --- Обработчики и логика ---

  const handleQwenChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQwenSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };
  const handleFluxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFluxSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };
  
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || (e.target as HTMLElement).tagName !== "TEXTAREA")) {
      e.preventDefault();
      onGenerate();
    }
    if (e.key === "Escape") {
      if (isLoading) onCancel();
    }
  };

  const handleLlmSettingsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setLlmSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };
  
  const onRefinePrompt = async () => {
    if (!rawPrompt.trim()) return;
    setIsRefining(true);
    setRefineError(null);
    abortControllerRef.current = new AbortController();

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      return btoa(binary);
    }

    let base64Image: string | undefined = undefined;
    if (sendImageToLlm && sourceFile) {
      const buffer = await sourceFile.arrayBuffer();
      base64Image = `data:${sourceFile.type};base64,${arrayBufferToBase64(buffer)}`;
    }

    const payload = {
      prompt: rawPrompt,
      model: llmSettings.model,
      system: llmSettings.systemPrompt,
      temperature: llmSettings.temperature,
      top_p: llmSettings.topP,
      max_completion_tokens: llmSettings.maxCompletionTokens,
      ...(base64Image ? { image: base64Image } : {}),
    };

    try {
      const response = await fetch("/api/refine-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Неизвестная ошибка API");
      }

      const data = await response.json();
      setPrompt(data.refinedPrompt);
      setShowRefiner(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setRefineError("Улучшение отменено.");
        else setRefineError(e.message);
      } else {
        setRefineError("Произошла неизвестная ошибка.");
      }
    } finally {
      setIsRefining(false);
    }
  };

  const isReadyToGenerate = useMemo(() => !!sourceFile && !!prompt.trim() && !isLoading, [sourceFile, prompt, isLoading]);

  const fail = (msg: string) => {
    setError(msg);
    setIsLoading(false);
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return fail(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) return fail("Неверный тип файла. Используйте PNG, JPEG или WebP.");
    
    setError(null);
    setResultUrl(null);
    setTab("source");
    setSourceFile(file);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    try {
      const dims = await readImageDims(file);
      setImageInfo(dims);
    } catch {
      setImageInfo(null);
    }
  };
  
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };
  
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };
  
  const onPaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const it of items) {
      if (it.type.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) {
          await handleFileSelect(file);
          break;
        }
      }
    }
  };

  const onClear = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceFile(null);
    setSourceUrl(null);
    setResultUrl(null);
    setError(null);
    setPrompt("");
    setImageInfo(null);
    setTab("source");
    setShowRefiner(false);
    setShowNeg(false);
    setSendImageToLlm(true);
    setSeedLock(false);
    setComparePos(50);
  };

  const onCancel = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setError("Генерация отменена.");
  };

  const randomizeSeed = () => {
    const seed = Math.floor(Math.random() * 2_147_483_647);
    if (selectedModel === "flux") setFluxSettings((p) => ({ ...p, seed }));
    if (selectedModel === "qwen") setQwenSettings((p) => ({ ...p, seed }));
  };
  
  const onGenerate = async () => {
    if (!isReadyToGenerate || !sourceFile) return;
    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append("image", sourceFile);
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", selectedModel);

    let settings: QwenSettings | FluxSettings;
    if (selectedModel === "qwen") {
      settings = qwenSettings;
    } else {
      settings = fluxSettings;
    }
    
    if (!seedLock) {
      const seed = Math.floor(Math.random() * 2_147_483_647);
      settings = { ...settings, seed };
      if (selectedModel === "flux") setFluxSettings(p => ({ ...p, seed }));
      if (selectedModel === "qwen") setQwenSettings(p => ({ ...p, seed }));
    }

    formData.append("settings", JSON.stringify(settings));

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Неизвестная ошибка API");
      }
      const data = await response.json();
      setResultUrl(data.imageUrl);
      setTab("result");
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Произошла неизвестная ошибка.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Возвращаем публичный API хука ---
  return {
    sourceFile,
    sourceUrl,
    resultUrl,
    prompt,
    setPrompt,
    rawPrompt,
    setRawPrompt,
    isRefining,
    refineError,
    sendImageToLlm,
    setSendImageToLlm,
    showRefiner,
    setShowRefiner,
    llmSettings,
    setLlmSettings,
    handleLlmSettingsChange,
    negativePrompt,
    setNegativePrompt,
    showNeg,
    setShowNeg,
    selectedModel,
    setSelectedModel,
    isLoading,
    error,
    imageInfo,
    tab,
    setTab,
    comparePos,
    setComparePos,
    seedLock,
    setSeedLock,
    qwenSettings,
    handleQwenChange,
    fluxSettings,
    handleFluxChange,
    dropRef,
    onKeyDown,
    onRefinePrompt,
    isReadyToGenerate,
    onFileChange,
    onDrop,
    onClear,
    onCancel,
    randomizeSeed,
    onGenerate,
  };
}
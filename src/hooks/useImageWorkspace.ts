// src/hooks/useImageWorkspace.ts

import { useState, useMemo, useEffect, useRef, ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { FluxSettings, LlmSettings, Model, QwenSettings, SeedreamSettings } from "@/lib/types"; // <--- ДОБАВИЛИ SeedreamSettings
import { loadPersist, readImageDims, savePersist } from "@/lib/utils";

const initialLlmSettings: LlmSettings = {
  model: 'gpt-5-mini',
  systemPrompt: `Ты — «Промт-Инженер», специализированный AI-аналитик. Твоя задача — анализировать сырые входные данные (изображение-чертеж сауны и текстовый список материалов с уже готовыми описаниями) и скомпоновать из них сверхкороткий, убийственно-точный промт для AI-«Художника» (модели типа Qwen-Image-Edit, FLUX).
Твои руководящие принципы:
Контекст: «Художники» (Qwen-Image-Edit и аналоги) держат фокус на первых 4-5 строках. Всё, что дальше — лотерея. Твой итоговый промт должен быть как телеграмма: максимум смысла в минимуме слов.
Фильтрация: На входе — чертеж и список материалов. Черные области на чертеже — это не дизайн, а дыры (окна, двери), которые нужно заполнить. Работай только с видимыми объектами и соответствующими им материалами из списка.
АЛГОРИТМ СБОРКИ ИТОГОВОГО ПРОМТА ДЛЯ «ХУДОЖНИКА»:
Твой итоговый промт должен иметь железобетонную структуру. Собирай его строго в этом порядке.
БЛОК 1: ЗАДАЧА, ГЕОМЕТРИЯ И ЧЕРНЫЕ ДЫРЫ (Высший приоритет)
Инструкция: Начинай промт с общей задачи, в которую вшито главное ограничение по геометрии. Сразу после, если видишь черные области, добавь команды для их замены. Это самый важный блок.
Шаблоны для генерации:
Преамбула: You are editing a 3D render to create a masterpiece. Preserve the exact geometry, proportions, and camera FOV.
Окно: ⚡ A black area on the wall = A photorealistic glass window with a thin wooden frame matching the reference, viewing a Scandinavian forest.
Панорамная стена: ⚡ A black wall = A panoramic, floor-to-ceiling glass wall with a thin frame matching the reference, viewing a Scandinavian forest. (Используй, если черная область занимает почти всю стену).
Дверь: ⚡ A black doorway = A frameless glass door leading into a bright, minimalist entryway finished with the same wood as the sauna walls.
БЛОК 2: МАТЕРИАЛЫ («Прямой проброс»)
Инструкция: Это твоя основная работа. Твоя задача — взять готовую строку с описанием материала из списка клиента и напрямую вставить ее в итоговый промт. Ничего не додумывай. Просто сгруппируй объекты с одинаковым материалом и передай описание как есть.
Формат генерации: [Объект 1], [Объект 2]: [Описание из списка клиента]. [Объект 3]: [Другое описание из списка].
Пример того, что ты должен сгенерить: Walls, floor: Canadian Cedar polished, with clear texture. Benches: Linden wood.
БЛОК 3: СВЕТ
Инструкция: После материалов добавь короткую, ясную команду по свету.
Шаблон для генерации: The lighting must be warm and soft with physically correct shadows; if a window is present, add contrasting cool daylight.
БЛОК 4: ФИНАЛЬНОЕ КАЧЕСТВО (Приказ)
Инструкция: В самом конце промта добавь одну мощную команду, которая задает финальную планку качества.
Шаблон для генерации: Elevate the entire image to the quality of an architectural magazine cover, focusing on photorealistic lighting and textures.
Формат вывода: Итоговый промт для «Художника» не должен превышать 5-7 предложений (примерно 200-250 токенов). Будь безжалостен к каждому слову.

'.`,
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
  const [seedreamSettings, setSeedreamSettings] = useState<SeedreamSettings>({ seed: 0, width: 1024, height: 1024 });


  const abortControllerRef = useRef<AbortController | null>(null);
  const dropRef = useRef<HTMLLabelElement | null>(null);

  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
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
    const loadedSeedream = p.seedreamSettings || {};
    setSeedreamSettings(prev => ({ ...{ seed: 0, width: 1024, height: 1024 }, ...loadedSeedream }));
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
      seedreamSettings,
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
    seedreamSettings,
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
  const handleSeedreamChange = (e: ChangeEvent<HTMLInputElement>) => { 
    setSeedreamSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
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
  
  const handleJsonFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      if (typeof event.target?.result !== 'string') {
        throw new Error("Не удалось прочитать файл.");
      }
      const parsed = JSON.parse(event.target.result);
      // Форматируем для красивого вывода
      setJsonContent(JSON.stringify(parsed, null, 2)); 
      setJsonError(null);
      setIsJsonViewerOpen(true); // Автоматически открываем окно при успехе
    } catch (e) {
      setJsonError("Ошибка парсинга. Убедись, что это валидный JSON-файл.");
      setJsonContent(null);
    }
  };
  reader.onerror = () => {
    setJsonError("Не удалось прочитать файл.");
    setJsonContent(null);
  };
  reader.readAsText(file);
};

const onJsonFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type === "application/json") {
    handleJsonFile(file);
  } else if (file) {
    setJsonError("Неверный тип файла. Нужен JSON.");
  }
  e.target.value = ""; // Сбрасываем инпут
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
    if (selectedModel === "seedream") setSeedreamSettings((p) => ({...p, seed }));
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

    let settings: QwenSettings | FluxSettings | SeedreamSettings;
    switch (selectedModel) {
      case "qwen":
        settings = qwenSettings;
        break;
      case "seedream":
        // Перед генерацией подставляем реальные размеры картинки
        settings = { ...seedreamSettings, width: imageInfo!.w, height: imageInfo!.h };
        break;
      case "flux":
      default:
        settings = fluxSettings;
        break;
    }
    
    if (!seedLock) {
      const seed = Math.floor(Math.random() * 2_147_483_647);
      settings = { ...settings, seed };
      if (selectedModel === "qwen") setQwenSettings(p => ({ ...p, seed }));
      if (selectedModel === "seedream") setSeedreamSettings(p => ({ ...p, seed }));
      if (selectedModel === "flux") setFluxSettings(p => ({ ...p, seed }));
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
    jsonContent,
    isJsonViewerOpen,
    setIsJsonViewerOpen,
    jsonError,
    onJsonFileChange,
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
    seedreamSettings,
    handleSeedreamChange,
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
// src/hooks/useImageWorkspace.ts

import { useState, useMemo, useEffect, useRef, ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { encode } from "gpt-tokenizer";
import { FluxSettings, LlmSettings, Model, QwenSettings, SeedreamSettings } from "@/lib/types";
import { loadPersist, readImageDims, savePersist } from "@/lib/utils";

const defaultLlmSettings: LlmSettings = {
  model: 'gpt-5-mini',
  systemPrompt: `Ты — «Промт-Инженер», специализированный AI-аналитик. Твоя задача — анализировать сырые входные данные (изображение-чертеж сауны с цветными областями и текстовый список материалов) и скомпоновать из них сверхкороткий, убийственно-точный промт для AI-«Художника» (модель Qwen-Image-Edit).

Твои руководящие принципы:

Контекст: «Художник» держит фокус на первых 4-5 строках. Твой итоговый промт должен быть как телеграмма: максимум смысла в минимуме слов, не превышая ~250 токенов.

Автономность: Ты не перекладываешь логику на «Художника». Ты сам анализируешь входные данные и принимаешь решения о том, какие инструкции включать в итоговый промт.

АЛГОРИТМ СБОРКИ ИТОГОВОГО ПРОМТА ДЛЯ «ХУДОЖНИКА»:

Собирай итоговый промт строго в этом порядке.

БЛОК 0: КОНТЕКСТ И ДИНАМИЧЕСКИЕ ТЕГИ (Новая логика)

Инструкция: В конце сообщения от пользователя ты получишь два тега: [VIEW_WINDOW: <описание>] и [VIEW_DOOR: <описание>]. Это высший приоритет. Ты ДОЛЖЕН использовать текст из этих тегов для генерации вида из окна и за дверью соответственно. <описание> может быть как коротким ключом (типа "beach"), так и полноценным описанием. Твоя задача — интегрировать это описание в шаблоны БЛОКА 1.

БЛОК 1: ЗАДАЧА, ГЕОМЕТРИЯ И ЦВЕТНЫЕ ПРОЕМЫ (Высший приоритет)

Инструкция: Начинай промт с прямого приказа о сохранении геометрии. Сразу после этого проанализируй цветные области и сгенерируй команды для их наполнения, используя данные из тегов.

Преамбула (обязательно):
Maintain precise geometry, proportions, and camera FOV. Create a masterpiece.

Проемы (использовать по наличию цвета):

🚪 Красная область (Дверь) — действуй по одному из двух сценариев:

Сценарий 1: Вся область проема красная. Это означает полностью стеклянную дверь. Используй шаблон, подставив в него описание из тега [VIEW_DOOR: ...]:
⚡ Generate instead A red area = a photorealistic glass door leading into a [описание из тега VIEW_DOOR], strictly preserving the original doorway frame's geometry.

Сценарий 2: На изображении есть объект "дверь" с материалом из списка, а красная область — лишь его часть. Это означает дверь со стеклянной вставкой. Твоя задача — найти в списке материал двери, и сгенерировать команду по этому шаблону, подставив описание из тега [VIEW_DOOR: ...]:
⚡ Generate: in the doorway, a [материал двери из списка] door with a transparent glass insert viewing a [описание из тега VIEW_DOOR], strictly preserving the original doorway frame's geometry.

🟦 Синяя область (Панорамное окно):
⚡ Generate instead A blue area = a panoramic, floor-to-ceiling glass wall viewing a [описание из тега VIEW_WINDOW], strictly preserving the original frame's geometry.

🟩 Зеленая область (Обычное окно):
⚡ Generate instead A green area = a photorealistic glass window viewing a [описание из тега VIEW_WINDOW], strictly preserving the original window frame's geometry.

БЛОК 2: МАТЕРИАЛЫ (Интеллектуальное редактирование)

Инструкция: Это твоя ключевая задача. Не копируй описание материала слепо. Действуй как редактор:
1. Проанализируй описание из списка клиента.
2. Извлеки только ключевые физические характеристики: тип материала, цвет, текстуру, рисунок волокон (зерно).
3. Удали всю субъективную, "маркетинговую" информацию (создает уют, долговечный вид, стильный).
4. Упрости формулировки, убирая очевидные слова (деревянная панель из акации → панель из акации).
5. Сгруппируй объекты с одинаковым финальным описанием.
6. Используй слово “generate:” в начале строки для группы материалов.

Пример того, что ты должен сгенерить: generate: Walls, columns, niche: hardwood board, rich brown, smooth polished surface, intricate wood grain. generate: Ceiling: walnut board, deep chocolate-brown, smooth texture. generate: Benches: chestnut board, light-brown, open rustic grain.

БЛОК 3: СВЕТ (Логический выбор)

Инструкция: Не используй условных операторов (if) в итоговом промте. Посмотри на входное изображение. Сам прими решение, какой шаблон света использовать.

Сценарий 1: НЕТ ОКОН (на картинке нет синих или зеленых областей).
Используй этот шаблон: The lighting is warm and soft with physically correct shadows, simulating high-quality interior fixtures.

Сценарий 2: ЕСТЬ ОКНО (на картинке есть синяя или зеленая область).
Используй этот шаблон: The lighting is predominantly natural daylight from the window, soft with physically correct shadows.

БЛОК 4: ФИНАЛЬНОЕ КАЧЕСТВО (Арт-директива)

Инструкция: Заверши промт мощной, финальной командой. Это не просто шаблон, а приказ, задающий планку качества всей сцене.
Elevate the entire image to the quality of an architectural magazine cover, focusing on photorealistic lighting and textures..

'.`,
  temperature: 1.0,
  topP: 1,
  maxCompletionTokens: 2000,
};

const initialLlmSettingsByModel: { [key in Model]?: Partial<LlmSettings> } = {
  gemini: { ...defaultLlmSettings },
  qwen: { ...defaultLlmSettings, systemPrompt: "СИСТЕМНЫЙ ПРОМТ ДЛЯ QWEN" },
  flux: { ...defaultLlmSettings, systemPrompt: "СИСТЕМНЫЙ ПРОМТ ДЛЯ FLUX" },
  seedream: { ...defaultLlmSettings, systemPrompt: "СИСТЕМНЫЙ ПРОМТ ДЛЯ SEEDREAM" },
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
  const [llmSettingsByModel, setLlmSettingsByModel] = useState(initialLlmSettingsByModel);
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
  const [seedreamTargetSize, setSeedreamTargetSize] = useState<1024 | 1280 | 'original'>(1024);
  const [windowView, setWindowView] = useState("a dense Scandinavian forest");
  const [doorView, setDoorView] = useState("a cozy antechamber (changing room)");
  
  

  // <<< НОВОЕ: Состояния для режима детализации
  const [results, setResults] = useState<string[]>([]);
  const [isDetailingMode, setIsDetailingMode] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const dropRef = useRef<HTMLLabelElement | null>(null);

  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [promptTokenCount, setPromptTokenCount] = useState(0);
  const [negativeTokenCount, setNegativeTokenCount] = useState(0);
  const [seedreamSizeWarning, setSeedreamSizeWarning] = useState<string | null>(null);
  
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
    if (p.llmSettingsByModel) setLlmSettingsByModel(p.llmSettingsByModel);
    if (typeof p.sendImageToLlm === "boolean") setSendImageToLlm(p.sendImageToLlm);
    if (typeof p.showRefiner === "boolean") setShowRefiner(p.showRefiner);
    if (typeof p.showNeg === "boolean") setShowNeg(p.showNeg);
    if (typeof p.seedLock === "boolean") setSeedLock(p.seedLock);
    if (p.tab) setTab(p.tab);
    if (typeof p.comparePos === "number") setComparePos(p.comparePos);
    if (p.seedreamTargetSize) setSeedreamTargetSize(p.seedreamTargetSize);
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
      llmSettingsByModel,
      sendImageToLlm,
      showRefiner,
      showNeg,
      seedLock,
      tab,
      comparePos,
      seedreamTargetSize,
    });
  }, [
    prompt,
    negativePrompt,
    selectedModel,
    qwenSettings,
    fluxSettings,
    seedreamSettings,
    llmSettingsByModel,
    sendImageToLlm,
    showRefiner,
    showNeg,
    seedLock,
    tab,
    comparePos,
    seedreamTargetSize,
  ]);
  
  useEffect(() => {
    // Эта функция очистки сработает только перед тем,
    // как sourceUrl будет изменен на новый, или при размонтировании.
    return () => {
      if (sourceUrl && sourceUrl.startsWith("blob:")) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]); // <-- Зависимость ТОЛЬКО от sourceUrl

  // Эффект №2: Чистит URL галереи только один раз при размонтировании компонента.
  useEffect(() => {
    return () => {
      // Это нужно, если мы решим делать превьюшки через blob,
      // для обычных URL это не сработает, но пусть будет на будущее.
      results.forEach(url => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // <-- Пустой массив зависимостей = сработает 1 раз при unmount.
  
  // Обработчик вставки из буфера обмена
  useEffect(() => {
    const handler = (ev: ClipboardEvent) => onPaste(ev);
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, []);

  useEffect(() => {
    setPromptTokenCount(encode(prompt).length);
    setNegativeTokenCount(encode(negativePrompt).length);
  }, [prompt, negativePrompt]);
// --- Эффект для предупреждения о размере Seedream ---
  useEffect(() => {
    if (selectedModel !== 'seedream' || !imageInfo || seedreamTargetSize === 'original') {
      setSeedreamSizeWarning(null);
      return;
    }

    const { w: originalWidth, h: originalHeight } = imageInfo;
    const ratio = originalWidth / originalHeight;
    let targetWidth: number;
    let targetHeight: number;

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
      
      setSeedreamSizeWarning(`Внимание: Запрошенный размер слишком мал. Результат будет увеличен до ${finalWidth}x${finalHeight}px.`);
    } else {
      setSeedreamSizeWarning(null);
    }
  }, [selectedModel, imageInfo, seedreamTargetSize]);

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
    const parsedValue = type === 'number' ? parseFloat(value) : value;

    setLlmSettingsByModel(prev => {
      const currentModelSettings = prev[selectedModel] ?? {};
      return {
        ...prev,
        [selectedModel]: {
          ...currentModelSettings,
          [name]: parsedValue,
        },
      };
    });
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

    const finalRawPrompt = `${rawPrompt.trim()}\n[VIEW_WINDOW: ${windowView}]\n[VIEW_DOOR: ${doorView}]`;

    const activeSettings = { ...defaultLlmSettings, ...llmSettingsByModel[selectedModel] };
    const payload = {
      prompt: finalRawPrompt,
      model: activeSettings.model,
      system: activeSettings.systemPrompt,
      temperature: activeSettings.temperature,
      top_p: activeSettings.topP,
      max_completion_tokens: activeSettings.maxCompletionTokens,
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

  // <<< ИЗМЕНЕНО: handleFileSelect теперь сбрасывает режим детализации
  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return fail(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) return fail("Неверный тип файла. Используйте PNG, JPEG или WebP.");
    
    setError(null);
    setResultUrl(null);
    setTab("source");
    
    // <<< Сброс состояния галереи и режима при загрузке нового файла
    setResults([]);
    setIsDetailingMode(false);
    setSeedreamSizeWarning(null);
    

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
        setJsonContent(JSON.stringify(parsed, null, 2)); 
        setJsonError(null);
        setIsJsonViewerOpen(true);
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
    e.target.value = "";
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

  // <<< ИЗМЕНЕНО: onClear теперь тоже сбрасывает галерею и режим
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
    // <<< Сброс состояния галереи и режима
    setResults([]);
    setIsDetailingMode(false);
    setSeedreamTargetSize(1024);
    setSeedreamSizeWarning(null);
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
  
  // <<< НОВОЕ: Функция для выбора результата из галереи как нового исходника
  const handleSelectResult = async (url: string) => {
    setIsLoading(true); // Блокируем интерфейс на время подготовки файла
    setError(null);
    
    try {
      // Скачиваем картинку по URL и превращаем в File
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "generated_source.png", { type: blob.type });

      // Обновляем состояния, как будто загрузили новый файл
      setSourceFile(file);
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      const newSourceUrl = URL.createObjectURL(file);
      setSourceUrl(newSourceUrl);

      setResultUrl(null);
      
      const dims = await readImageDims(file);
      setImageInfo(dims);
      
      // Переключаемся в режим детализации и очищаем промпт
      setIsDetailingMode(true);
      setPrompt(""); // Очищаем поле для новой, короткой инструкции
      setTab("source"); // Показываем новый исходник
      
    } catch (e) {
        fail("Не удалось загрузить изображение для доработки.");
    } finally {
        setIsLoading(false);
    }
  };
  
  // <<< ИЗМЕНЕНО: Основная функция генерации теперь учитывает режим
  const onGenerate = async () => {
    if (!isReadyToGenerate || !sourceFile) return;
    setIsLoading(true);
    setError(null);
    // Не очищаем resultUrl, чтобы последняя картинка не пропадала во время генерации новой
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
      case "seedream": { 
        let targetWidth = imageInfo!.w;
        let targetHeight = imageInfo!.h;
  
        if (seedreamTargetSize !== 'original') {
          const originalWidth = imageInfo!.w;
          const originalHeight = imageInfo!.h;
          const ratio = originalWidth / originalHeight;
          const targetSide = seedreamTargetSize;
  
          if (originalWidth >= originalHeight) {
            targetWidth = targetSide;
            targetHeight = Math.round(targetSide / ratio);
          } else {
            targetHeight = targetSide;
            targetWidth = Math.round(targetSide * ratio);
          }
        }

        // <<< ФИНАЛЬНАЯ ПРОВЕРКА И АПСКЕЙЛ ПЕРЕД ОТПРАВКОЙ
        if (targetWidth < 1024 || targetHeight < 1024) {
            const minSide = Math.min(targetWidth, targetHeight);
            const scaleFactor = 1024 / minSide;
            targetWidth = Math.round(targetWidth * scaleFactor);
            targetHeight = Math.round(targetHeight * scaleFactor);
        }
        
        settings = { ...seedreamSettings, width: targetWidth, height: targetHeight };
        break;
      }
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
      
      // <<< Обновляем состояния после генерации
      setResultUrl(data.imageUrl); // Показываем новый результат
      setResults(prev => [...prev, data.imageUrl]); // Добавляем его в галерею
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
     llmSettingsByModel,
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
    results,
    isDetailingMode,
    handleSelectResult,
    promptTokenCount,
    negativeTokenCount,
    seedreamTargetSize,
    setSeedreamTargetSize,
    seedreamSizeWarning,
    windowView,
    setWindowView,
    doorView,
    setDoorView,
  };
}
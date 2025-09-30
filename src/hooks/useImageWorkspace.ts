// src/hooks/useImageWorkspace.ts

import { useState, useMemo, useEffect, useRef, ChangeEvent, DragEvent, KeyboardEvent, useCallback } from "react";
import { encode } from "gpt-tokenizer";
import { FluxSettings, LlmSettings, Model, QwenSettings, SeedreamSettings, GenerationNode } from "@/lib/types"; // добавили GenerationNode
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

  // Глобальный режим и дерево историй
  const [activeTab, setActiveTab] = useState<'BASE' | 'PRO'>('BASE');
  const [baseResults, setBaseResults] = useState<GenerationNode[]>([]);
  const [selectedBaseResultUrl, setSelectedBaseResultUrl] = useState<string | null>(null);
  
  // <<< ИЗМЕНЕНО: Старую историю заменяем на воркспейсы
  const [workspaces, setWorkspaces] = useState<{ [rootNodeId: string]: GenerationNode[] }>({});
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null); // <<< Отдельно храним активный узел в дереве

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [rawPrompt, setRawPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [sendImageToLlm, setSendImageToLlm] = useState(true);
  const [showRefiner, setShowRefiner] = useState(false);
  const [llmSettingsByModel, setLlmSettingsByModel] = useState(initialLlmSettingsByModel);
  const [negativePrompt, setNegativePrompt] = useState("blurry, ugly, deformed, text, watermark");
  const [showNeg, setShowNeg] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>("qwen"); // по умолчанию Qwen для первого такта
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

  const abortControllerRef = useRef<AbortController | null>(null);
  const dropRef = useRef<HTMLLabelElement>(null);

  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [promptTokenCount, setPromptTokenCount] = useState(0);
  const [negativeTokenCount, setNegativeTokenCount] = useState(0);
  const [seedreamSizeWarning, setSeedreamSizeWarning] = useState<string | null>(null);

  // --- Вычисляемые значения ---

  const activeHistory = useMemo(() => {
    if (!activeWorkspaceId) return [];
    return workspaces[activeWorkspaceId] ?? [];
  }, [workspaces, activeWorkspaceId]);

  const activeNode = useMemo(() => {
    if (!activeNodeId) return null;
    return activeHistory.find(node => node.id === activeNodeId) ?? null;
  }, [activeNodeId, activeHistory]);

  const isReadyToGenerate = useMemo(() => {
    if (activeTab === 'BASE') {
      return !!sourceFile && !!(prompt || "").trim() && !isLoading;
    }
    // в PRO-режиме готовность такая же, как и раньше
    return !!activeNode && !!(prompt || "").trim() && !isLoading;
  }, [activeTab, sourceFile, activeNode, prompt, isLoading]);

  // --- Обработчики и логика (ПЕРЕМЕЩЕННЫЙ БЛОК ФУНКЦИЙ) ---
  
  const fail = useCallback((msg: string) => {
    setError(msg);
    setIsLoading(false);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return fail(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return fail("Неверный тип файла. Используйте PNG, JPEG или WebP.");
    }
    setError(null);
    setTab("source");
    setActiveNodeId(null);
    setBaseResults([]);
    setSelectedBaseResultUrl(null);
    setActiveTab("BASE");
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
  }, [sourceUrl, fail]);
  
  const onPaste = useCallback(async (e: ClipboardEvent) => {
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
  }, [handleFileSelect]);

  // --- Эффекты (Effects) ---

  // Загрузка состояния из localStorage
  useEffect(() => {
    const p = loadPersist();
    if (!p) return;

    // Новые состояния
    
    setBaseResults(p.baseResults ?? []);
    setActiveTab(p.activeTab ?? 'BASE');
    setSelectedBaseResultUrl(p.selectedBaseResultUrl ?? null);

    // Старые поля
    setPrompt(p.prompt ?? "");
    setNegativePrompt(p.negativePrompt ?? "blurry, ugly, deformed, text, watermark");
    setSelectedModel(p.selectedModel ?? "qwen");
    setQwenSettings(p.qwenSettings ?? { guidance_scale: 4, num_inference_steps: 30, seed: 0 });
    setFluxSettings(p.fluxSettings ?? { guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });
    const defaults = { seed: 0, width: 1024, height: 1024 };
    setSeedreamSettings({ ...defaults, ...(p.seedreamSettings || {}) });
    if (p.llmSettingsByModel) setLlmSettingsByModel(p.llmSettingsByModel);
    if (typeof p.sendImageToLlm === "boolean") setSendImageToLlm(p.sendImageToLlm);
    if (typeof p.showRefiner === "boolean") setShowRefiner(p.showRefiner);
    if (typeof p.showNeg === "boolean") setShowNeg(p.showNeg);
    if (typeof p.seedLock === "boolean") setSeedLock(p.seedLock);
    if (p.tab) setTab(p.tab);
    if (typeof p.comparePos === "number") setComparePos(p.comparePos);
    if (p.seedreamTargetSize) setSeedreamTargetSize(p.seedreamTargetSize);
  }, []);

  // Сохранение состояния в localStorage
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
    seedreamTargetSize, // <<< Добавили недостающее поле
    activeTab,
    baseResults,
    selectedBaseResultUrl,
    workspaces,
    activeWorkspaceId,
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
  seedreamTargetSize, // <<< Добавили зависимость
  baseResults,
  activeTab,
  selectedBaseResultUrl,
  workspaces,
  activeWorkspaceId,
]);

  // Чистка blob URL исходника
  useEffect(() => {
    return () => {
      if (sourceUrl && sourceUrl.startsWith("blob:")) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]);

  // Обработчик вставки из буфера обмена (ТЕПЕРЬ `onPaste` ПЕРЕД НИМ ОБЪЯВЛЕН)
  useEffect(() => {
    const handler = (ev: ClipboardEvent) => onPaste(ev);
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [onPaste]);

  useEffect(() => {
    setPromptTokenCount(encode(prompt || "").length);
    setNegativeTokenCount(encode(negativePrompt || "").length);
  }, [prompt, negativePrompt]);

  // Предупреждение о размере Seedream
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

  // --- Обработчики и логика (ПРОДОЛЖЕНИЕ) ---

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
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setRefineError("Улучшение отменено.");
        } else {
          setRefineError(error.message);
        }
      } else {
        setRefineError("Произошла неизвестная ошибка.");
      }
    } finally {
      setIsRefining(false);
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
    e.target.value = ""; // Очищаем инпут, чтобы можно было выбрать тот же файл повторно
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

 // Полный сброс
    const onClear = () => {
      // Сброс ошибок и источника
      setError(null);
      setSourceFile(null);
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      setSourceUrl(null);
      setImageInfo(null);

      // Сброс флагов/мелочей
      setSeedLock(false);
      setShowRefiner(false);
      setShowNeg(false);
      setSeedreamSizeWarning(null);

      // <<< ИЗМЕНЕНО: Полный сброс по новой логике (без appState)
      
      setActiveNodeId(null);
      setBaseResults([]);
      setSelectedBaseResultUrl(null);
      setActiveTab("BASE");

      // возврат на вкладку source (чтобы интерфейс не висел в старом состоянии)
      setTab("source");
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
    if (selectedModel === "seedream") setSeedreamSettings((p) => ({ ...p, seed }));
  };
  // <<< НОВОЕ: Функция для "продвижения" базового результата в PRO
  // <<< НОВОЕ: Функция для сброса активного воркспейса (возврат в "Прихожую")
  const handleTabChange = (tab: 'BASE' | 'PRO') => {
    if (tab === 'PRO') {
      // "Автопилот": если в PRO еще не работали, но в BASE есть результаты - берем последний
      if (!activeWorkspaceId && baseResults.length > 0) {
        const lastBaseResult = baseResults[baseResults.length - 1];
        handlePromoteToPro(lastBaseResult.id); // Продвигаем его и автоматом переходим на таб
        return;
      }
    }
    setActiveTab(tab);
  };
  const handleChangeSource = () => {
    setActiveWorkspaceId(null);
    setActiveNodeId(null);
  };

  // <<< ПЕРЕПИСАНО: Функция продвижения теперь создает или активирует воркспейс
  const handlePromoteToPro = (nodeId: string) => {
    const nodeToPromote = baseResults.find(node => node.id === nodeId);
    if (!nodeToPromote) {
      fail("Не удалось найти базовый результат для начала работы.");
      return;
    }

    // Если для этого узла еще нет воркспейса - создаем
    if (!workspaces[nodeToPromote.id]) {
      setWorkspaces(prev => ({
        ...prev,
        [nodeToPromote.id]: [nodeToPromote] // История начинается с этого узла
      }));
    }
    
    // Активируем этот воркспейс и его корневой узел
    setActiveWorkspaceId(nodeToPromote.id);
    setActiveNodeId(nodeToPromote.id);
    setActiveTab('PRO');
  };

  // <<< ПЕРЕПИСАНО: Генерация теперь зависит от активной вкладки

  const onGenerate = async () => {
    if (!isReadyToGenerate) return;

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    let currentImageFile: File;
    let parentId: string | null = null;

    if (activeTab === 'BASE') {
      if (!sourceFile) return fail("Нет исходного файла для базовой генерации.");
      currentImageFile = sourceFile;
      parentId = null;
    } else {
      if (!activeNode) return fail("Нет активного узла для редактирования в PRO.");
      parentId = activeNodeId;
      try {
        const response = await fetch(activeNode.imageUrl);
        const blob = await response.blob();
        currentImageFile = new File([blob], "pro_source.png", { type: blob.type });
        // <<< ИЗМЕНЕНО: Полностью удалили переменную _e, заменив на пустой catch
      } catch {
        return fail("Не удалось загрузить изображение из активного узла.");
      }
    }

    let effectiveImageInfo = imageInfo;
    try {
      const dims = await readImageDims(currentImageFile);
      effectiveImageInfo = dims;
    } catch {
      // не критично
    }

    const formData = new FormData();
    formData.append("image", currentImageFile);
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", selectedModel);

    let settings: QwenSettings | FluxSettings | SeedreamSettings;
    switch (selectedModel) {
      case "qwen":
        settings = qwenSettings;
        break;
      case "seedream": {
        const origW = effectiveImageInfo?.w ?? 1024;
        const origH = effectiveImageInfo?.h ?? 1024;
        const ratio = origW / origH;
        let targetWidth = origW;
        let targetHeight = origH;

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
        signal: abortControllerRef.current!.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Неизвестная ошибка API");
      }
      const data = await response.json();
      
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId,
        imageUrl: data.imageUrl,
        prompt,
        negativePrompt,
        model: selectedModel,
        settings,
      };

      if (activeTab === 'BASE') {
        setBaseResults(prev => [...prev, newNode]);
        setSelectedBaseResultUrl(newNode.imageUrl);
      } else {
        if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса для добавления узла.");
        
        setWorkspaces(prev => ({
          ...prev,
          [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode]
        }));
        setActiveNodeId(newNode.id);
      }

    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка при генерации");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Возвращаем публичный API хука ---
  return {
    // Новая архитектура
    activeTab,
    handleTabChange,
    handleChangeSource,
    baseResults,
    selectedBaseResultUrl,
    setSelectedBaseResultUrl,
    handlePromoteToPro,
    activeHistory,
    activeNode,
    activeNodeId,
    setActiveNodeId,
    comparePos,
    setComparePos,

    // Состояния и управление
    sourceFile,
    sourceUrl,
    imageInfo,
    isLoading,
    error,
    isReadyToGenerate,

    // Промпты
    prompt,
    setPrompt,
    rawPrompt,
    setRawPrompt,
    negativePrompt,
    setNegativePrompt,
    promptTokenCount,
    negativeTokenCount,

    // Выбор модели
    selectedModel,
    setSelectedModel,

    // Настройки моделей
    qwenSettings,
    handleQwenChange,
    fluxSettings,
    handleFluxChange,
    seedreamSettings,
    handleSeedreamChange,
    seedreamTargetSize,
    setSeedreamTargetSize,
    seedreamSizeWarning,
    seedLock,
    setSeedLock,
    randomizeSeed,
    
    // Промпт-инженер (LLM)
    isRefining,
    refineError,
    onRefinePrompt,
    sendImageToLlm,
    setSendImageToLlm,
    llmSettingsByModel,
    handleLlmSettingsChange,

    // Управление UI
    showRefiner,
    setShowRefiner,
    showNeg,
    setShowNeg,
    dropRef,
    windowView,
    setWindowView,
    doorView,
    setDoorView,
    jsonContent,
    isJsonViewerOpen,
    setIsJsonViewerOpen,
    jsonError,
    onJsonFileChange,
    
    // Функции-действия
    onGenerate,
    onClear,
    onCancel,
    onFileChange,
    onDrop,
    onKeyDown,
    onPaste,
  };
}
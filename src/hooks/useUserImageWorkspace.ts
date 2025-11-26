"use client";

import { useState, useMemo, useEffect, useRef, KeyboardEvent } from "react";
import { GenerationNode } from "@/lib/types";
import { loadPersist, savePersist } from "@/lib/utils"; // оставил на будущее, не мешает
import * as api from "@/lib/api";
import { useFileHandler } from "@/hooks/useFileHandler";
import { LLM_SYSTEM_PROMPT } from "@/lib/constants";

// Этот хук — упрощённый "автопилот" для /user.
// Модели и настройки захардкожены, без свободы выбора.

type Dims = { w: number; h: number } | null;

// ВАЖНО: NEG_DEFAULT нужен уже в initial state ниже — вынес его сюда
const NEG_DEFAULT = "blurry, ugly, deformed, text, watermark, toilet, toilet bowl, urinal";

export function useUserImageWorkspace() {
  // --- БЛОК УПРАВЛЕНИЯ ФАЙЛАМИ ---
  const {
    sourceFile,
    sourceUrl,
    sourceDataUrl,
    imageInfo,
    fileError,
    dropRef,
    onFileChange,
    onDrop,
    clearFile,
  } = useFileHandler();

  // --- БЛОК СОСТОЯНИЯ ---
  const [activeTab, setActiveTab] = useState<"BASE" | "PRO">("BASE");
  const [baseResults, setBaseResults] = useState<GenerationNode[]>([]);
  const [selectedBaseResultUrl, setSelectedBaseResultUrl] = useState<string | null>(null);
  const [compareSourceUrl, setCompareSourceUrl] = useState<string | null>(null);

  // Состояние для PRO-режима
  const [workspaces, setWorkspaces] = useState<{ [rootNodeId: string]: GenerationNode[] }>({});
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeNodeDims, setActiveNodeDims] = useState<Dims>(null);

  // Промпты. RawPrompt для BASE, просто Prompt для PRO.
  const [rawPrompt, setRawPrompt] = useState(""); // JSON-промпт из конструктора
  const [prompt, setPrompt] = useState(""); // Промпт для PRO-редактора
  const [negativePrompt, setNegativePrompt] = useState(NEG_DEFAULT);
  const [showNeg, setShowNeg] = useState(false);
  const [promptTokenCount] = useState(0);
  const [negativeTokenCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparePos, setComparePos] = useState(50);
  const [windowView, setWindowView] = useState("Green summer forest, photorealism, high detail|snow-covered winter forest, photorealism, high detail|a majestic view of the snow-capped Alpine mountains under a clear blue sky,photorealism, high detail|a neat suburban backyard in summer with a manicured green lawn and a wooden fence,photorealism, high detail|a suburban backyard in winter, covered in a fresh blanket of snow,photorealism, high detail|the lake, photorealism, high detail");
  const [doorView, setDoorView] = useState("a cozy antechamber (changing room)");
  const [helperPrompts, setHelperPrompts] = useState({
    background: "",
    style: "",
    texture: "",
    object: "",
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // --- ПРОИЗВОДНЫЕ СОСТОЯНИЯ ---
  const activeHistory = useMemo(
    () => workspaces[activeWorkspaceId ?? ""] ?? [],
    [workspaces, activeWorkspaceId]
  );

  const activeNode = useMemo(
    () => activeHistory.find((node) => node.id === activeNodeId) ?? null,
    [activeNodeId, activeHistory]
  );

  const isReadyToGenerateBase = useMemo(
    () => !!sourceFile && !!rawPrompt.trim() && !isLoading,
    [sourceFile, rawPrompt, isLoading]
  );
  const isReadyToGeneratePro = useMemo(
    () => !!activeNode && !!prompt.trim() && !isLoading,
    [activeNode, prompt, isLoading]
  );

  useEffect(() => {
    if (fileError) setError(fileError);
  }, [fileError]);

  useEffect(() => {
    if (!activeNode) {
      setActiveNodeDims(null);
      return;
    }
    getDimsFromUrl(activeNode.imageUrl).then(setActiveNodeDims);
  }, [activeNode]);

  useEffect(() => {
    const p = loadPersist();
    if (!p) return;

    // Валидация состояния, чтобы не загружать битый PRO-режим
    const loadedWorkspaces = p.workspaces ?? {};
    const loadedActiveWorkspaceId = p.activeWorkspaceId ?? null;
    let finalActiveTab = p.activeTab ?? "BASE";

    if (
      finalActiveTab === "PRO" &&
      (!loadedActiveWorkspaceId || !loadedWorkspaces[loadedActiveWorkspaceId])
    ) {
      // Если мы должны быть в PRO, но воркспейса нет - падаем в BASE
      finalActiveTab = "BASE";
    }

    setBaseResults(p.baseResults ?? []);
    setWorkspaces(loadedWorkspaces);
    setActiveWorkspaceId(loadedActiveWorkspaceId);
    setActiveNodeId(p.activeNodeId ?? null);
    setActiveTab(finalActiveTab);
    
    // Можно добавить загрузку и других полей, если нужно
    setComparePos(p.comparePos ?? 50);

  }, []); // Пустой массив зависимостей = выполняется один раз при монтировании

  // Сохранение состояния при любом его изменении
  useEffect(() => {
    savePersist({
      // BASE
      baseResults,
      selectedBaseResultUrl,
      
      // PRO
      workspaces,
      activeWorkspaceId,
      activeNodeId,
      activeNodeDims,

      // UI State
      activeTab,
      comparePos,
      
      // Эти поля пока не используем в /user, но для совместимости пусть будут
      prompt: '',
      negativePrompt: '',
      selectedModel: 'qwen',
      qwenSettings: { guidance_scale: 0, num_inference_steps: 0, seed: 0 },
      fluxSettings: { guidance_scale: 0, safety_tolerance: 0, seed: 0 },
      seedreamSettings: { seed: 0, width: 0, height: 0 },
      llmSettingsByModel: {},
      sendImageToLlm: false,
      showRefiner: false,
      showNeg: false,
      seedLock: false,
      tab: 'compare',
      seedreamTargetSize: 'original',
    });
  }, [
    baseResults, 
    selectedBaseResultUrl, 
    workspaces, 
    activeWorkspaceId, 
    activeNodeId, 
    activeNodeDims,
    activeTab, 
    comparePos
  ]);

  // --- УТИЛИТЫ ---

  const fail = (msg: string) => {
    setError(msg);
    setIsLoading(false);
    return;
  };

  const randomSeed = () => Math.floor(Math.random() * 2_147_483_647);

  const getDimsFromUrl = (url: string): Promise<Dims> =>
    new Promise((res) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => res(null);
      img.src = url;
    });

  // фиксированные настройки под "автопилот"
  const getFixedSettings = (model: "qwen" | "gemini" | "seedream" | "flux", dims?: Dims) => {
    const base: Record<string, number> = {
    guidance_scale: 4,
    num_inference_steps: 30,
    seed: randomSeed(),
  };

    // seedream обычно чувствителен к тем же размерам, что и вход
    if (model === "seedream" && dims) {
      base.target_width = dims.w;
      base.target_height = dims.h;
    }

    // Можно расширять при желании, но по умолчанию — одинаково
    return base;
  };

  const fetchUrlAsFile = async (url: string, name = "source.png"): Promise<File> => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new File([blob], name, { type: blob.type });
  };

  // --- ГЛАВНАЯ ЛОГИКА АВТОМАТИЗАЦИИ (BASE) ---
  const onGenerate = async () => {
    if (!isReadyToGenerateBase) {
      setError("Нужен и скетч, и JSON-промпт.");
      return;
    }

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      // 1) Автозапуск промпт-инженера (жёстко: gpt-5-mini)
      let selectedWindowView = windowView;
      if (windowView.includes('|')) {
        const options = windowView.split('|').filter(s => s.trim().length > 0);
        selectedWindowView = options[Math.floor(Math.random() * options.length)].trim();
      }
      const finalRawPrompt = `${rawPrompt.trim()}\n[VIEW_WINDOW: ${selectedWindowView}]\n[VIEW_DOOR: ${doorView}]`;
      const refinePayload = {
        prompt: finalRawPrompt,
        model: "gpt-5-mini",
        system: LLM_SYSTEM_PROMPT,
        image: sourceDataUrl, // всегда шлём картинку
        max_completion_tokens: 2000, // <<< ВОТ ОН, РОДИМЫЙ
      };

      const refineData = await api.refinePrompt(refinePayload, abortControllerRef.current.signal);
      const refinedPrompt = refineData?.refinedPrompt;
      if (!refinedPrompt) throw new Error("Промпт-инженер вернул пустой результат.");

      // 2) Генерация (жёстко: qwen)
      const settings = getFixedSettings("qwen");
      const formData = new FormData();
      formData.append("image", sourceFile!);
      formData.append("prompt", refinedPrompt);
      formData.append("negative_prompt", NEG_DEFAULT);
      formData.append("model", "qwen");
      formData.append("settings", JSON.stringify(settings));

      const imageData = await api.generateImage(formData, abortControllerRef.current!.signal);

      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: null,
        imageUrl: imageData.imageUrl,
        sourceImageUrl: sourceDataUrl!,
        prompt: refinedPrompt,
        negativePrompt: NEG_DEFAULT,
        model: "qwen",
        settings,
      };

      setBaseResults((prev) => [...prev, newNode]);
      setSelectedBaseResultUrl(newNode.imageUrl);
      setCompareSourceUrl(newNode.sourceImageUrl);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Операция отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- ЛОГИКА PRO-РЕЖИМА ---

  const ensureProContext = () => {
    if (!activeNode) {
      fail("Нет активного узла для доработки.");
      return false;
    }
    if (!activeWorkspaceId) {
      fail("Критическая ошибка: нет активного воркспейса.");
      return false;
    }
    return true;
  };

  const pushProNode = (node: GenerationNode) => {
    if (!activeWorkspaceId) return;
    setWorkspaces((prev) => ({
      ...prev,
      [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), node],
    }));
    setActiveNodeId(node.id);
  };

  // Замена фона через окна/дверь (жёстко: gemini)
  // Модель 'gemini' зашита по брифу
  const onGenerateBackgroundReplacement = async (
    referenceFile: File | null,
    targets: { window: boolean; door: boolean }
  ) => {
    if (!ensureProContext() || !activeNode) return;

    const targetAreas: string[] = [];
    if (targets.window) targetAreas.push("the windows");
    if (targets.door) targetAreas.push("the glass door");
    if (targetAreas.length === 0) return fail("Не выбраны цели для замены фона.");

    const promptTarget = targetAreas.join(" and ");
    const userClarification = helperPrompts.background.trim();

    let prompt: string;
    if (referenceFile) {
      const basePrompt = `In the source image, replace the background seen through ${promptTarget} with the scene from the reference image. The new background must be organically integrated. Adapt the lighting and color tones inside the sauna to realistically match the new background. Preserve the original sauna's interior geometry.`;
      prompt = userClarification ? `${basePrompt} User clarification: "${userClarification}".` : basePrompt;
    } else if (userClarification) {
      prompt = `In the source image, replace the background seen through ${promptTarget} with the following scene: "${userClarification}". Make it photorealistic and organically integrated. Adapt the lighting and color tones inside the sauna to realistically match the new background. Preserve the original sauna's interior geometry.`;
    } else {
      return fail("Не указан ни файл-референс, ни текстовое описание фона.");
    }

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const dims = activeNodeDims;
      const srcFile = await fetchUrlAsFile(activeNode.imageUrl, "pro_source.png");

      const settings = getFixedSettings("gemini", dims);
      const formData = new FormData();
      formData.append("image", srcFile);
      if (referenceFile) formData.append("reference_image", referenceFile);
      formData.append("prompt", prompt);
      formData.append("negative_prompt", NEG_DEFAULT);
      formData.append("model", "gemini");
      formData.append("settings", JSON.stringify(settings));

      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt: NEG_DEFAULT,
        model: "gemini",
        settings,
      };
      pushProNode(newNode);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Операция отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Замена текстуры по карте со стрелкой + файл текстуры (жёстко: seedream)
  // Модель 'gemini' зашита по брифу
  const onGenerateTextureReplacement = async (targetMapFile: File, textureFile: File) => {
    if (!ensureProContext() || !activeNode) return;

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    const basePrompt = `The source image contains a prominent red arrow pointing to a target object. The reference image contains a texture. Your task is to replace the texture of the object indicated by the arrow with the texture from the reference image.
Crucially:
1. The red arrow must be completely removed from the final result.
2. Preserve the MACRO-geometry: the overall shape of the object, as well as the scene's lighting and shadows.
3. Preserve the MICRO-geometry: If the target object is made of individual components like planks, boards, or tiles, you MUST maintain the original seams, gaps, and grooves between them. The new texture should be applied to each individual component, not to the object as a single flat surface.`;
    const userClarification = helperPrompts.texture.trim();
    const prompt = userClarification ? `${basePrompt} A user has provided this clarification: "${userClarification}".` : basePrompt;
    const negativePrompt = "red arrow, pointer, indicator";

    try {
      const dims = activeNodeDims;
      const settings = getFixedSettings("gemini", dims);

      const formData = new FormData();
      formData.append("image", targetMapFile);
      formData.append("reference_image", textureFile);
      formData.append("prompt", prompt);
      formData.append("negative_prompt", negativePrompt);
      formData.append("model", "gemini");
      formData.append("settings", JSON.stringify(settings));

      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt,
        model: "gemini",
        settings,
      };
      pushProNode(newNode);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Операция отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Замена стиля (жёстко: gemini)
  // Модель 'gemini' зашита по брифу
  const onGenerateStyleReplacement = async (referenceFile: File | null) => {
    if (!ensureProContext() || !activeNode) return;

    const userClarification = helperPrompts.style.trim();
    let prompt: string;

    if (referenceFile) {
      const basePrompt = `Redraw the source image (image 1), adhering to two strict rules:
1. **PRESERVE:** You must preserve ONLY the geometry and composition of the source image.
2. **TRANSFER:** You must transfer the style from the reference image (image 2) down to the smallest detail, including its exact color palette, lighting scheme, and surface textures.`;
      prompt = userClarification ? `${basePrompt}\nAdditional user hint: "${userClarification}".` : basePrompt;
    } else if (userClarification) {
      prompt = `Redraw the source image to perfectly match the following style: "${userClarification}".
CRITICAL RULE: Preserve ONLY the geometry and composition of the source image. The final result must match the described style down to the smallest detail in terms of color, lighting, and texture.`;
    } else {
      return fail("Не указан ни файл-референс, ни текстовое описание стиля.");
    }

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const dims = activeNodeDims;
      const srcFile = await fetchUrlAsFile(activeNode.imageUrl, "pro_source.png");

      const settings = getFixedSettings("gemini", dims);
      const formData = new FormData();
      formData.append("image", srcFile);
      if (referenceFile) formData.append("reference_image", referenceFile);
      formData.append("prompt", prompt);
      formData.append("negative_prompt", NEG_DEFAULT);
      formData.append("model", "gemini");
      formData.append("settings", JSON.stringify(settings));

      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt: NEG_DEFAULT,
        model: "gemini",
        settings,
      };
      pushProNode(newNode);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Операция отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Внедрение объекта по карте со стрелкой + референс объекта (жёстко: seedream)
  // Модель 'gemini' зашита по брифу
  const onGenerateObjectInjection = async (targetMapFile: File, objectFile: File) => {
    if (!ensureProContext() || !activeNode) return;

    const basePrompt = `Seamlessly integrate the object from the reference image into the source image at the location indicated by the red arrow. The arrow must be completely removed from the final result. Match the lighting, shadows, and perspective of the source image to ensure the object looks natural in the environment.`;
    const userClarification = helperPrompts.object.trim();
    const prompt = userClarification ? `${basePrompt} A user has provided this clarification: "${userClarification}".` : basePrompt;
    const negativePrompt = "red arrow, pointer, indicator";

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const dims = activeNodeDims;
      const settings = getFixedSettings("gemini", dims);

      const formData = new FormData();
      formData.append("image", targetMapFile);
      formData.append("reference_image", objectFile);
      formData.append("prompt", prompt);
      formData.append("negative_prompt", negativePrompt);
      formData.append("model", "gemini");
      formData.append("settings", JSON.stringify(settings));

      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt,
        model: "gemini",
        settings,
      };
      pushProNode(newNode);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Операция отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Внедрение 3D-объекта (реф-картинка) в сплошную красную область (жёстко: gemini)
  // Модель 'gemini' зашита по брифу
  const onGenerateObjectInjection3D = async (
    targetMapFile: File,
    referenceObjectFile: File,
    extraHint: string
  ) => {
    if (!ensureProContext() || !activeNode) return;

    let prompt =
      'Place the object from the reference image into the solid red area on the main image. For a seamless integration, you MUST adapt the object to the scene by perfectly matching its lighting, shadows, and PERSPECTIVE. You are permitted to slightly alter the object\'s original angle if it\'s necessary to achieve photorealism and correct alignment with the scene\'s geometry. CRITICAL INSTRUCTION: The red area is a placement marker ONLY. It MUST be completely removed and invisible in the final image.';
    if (extraHint?.trim()) prompt += ` An additional user hint is: "${extraHint.trim()}".`;

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const dims = activeNodeDims;
      const settings = getFixedSettings("gemini", dims);

      const formData = new FormData();
      formData.append("image", targetMapFile);
      formData.append("reference_image", referenceObjectFile);
      formData.append("prompt", prompt);
      formData.append("model", "gemini");
      formData.append("settings", JSON.stringify(settings));

      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt: "",
        model: "gemini",
        settings,
      };
      pushProNode(newNode);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Операция отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Редактирование по стрелкам (жёстко: seedream)
  // Модель 'seedream' зашита по брифу
  const onGenerateArrowEdits = async (imageBlob: Blob, instructionsText: string) => {
    if (!ensureProContext() || !activeNode) return;
    if (!instructionsText.trim()) return fail("Нет инструкций для выполнения.");

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const imageFile = new File([imageBlob], "arrow_edit_map.png", { type: "image/png" });

      // разбиваем инструкции в нумерованный список
      const instructionsArray = instructionsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const formatted = instructionsArray.map((v, i) => `${i + 1}. ${v}`).join("\n");

      const prompt = `Execute the following numbered instructions at the locations indicated by the corresponding red arrows.

Instructions:
${formatted}

CRITICAL: After applying all edits, you MUST remove all red arrows, numbers, and text annotations from the final image. The output should be a clean photograph.`;

      const dims = activeNodeDims;
      const settings = getFixedSettings("seedream", dims);

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("prompt", prompt);
      formData.append("negative_prompt", "text, annotations, arrows, indicators, pointers");
      formData.append("model", "seedream");
      formData.append("settings", JSON.stringify(settings));

      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt: "text, annotations, arrows, indicators, pointers",
        model: "seedream",
        settings,
      };
      pushProNode(newNode);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Операция отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Генерация из PRO-редактора по инструкции (жёстко: qwen)
  // Модель 'qwen' зашита по брифу
  const onGeneratePro = async () => {
    if (!isReadyToGeneratePro || !activeNode) return;

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const srcFile = await fetchUrlAsFile(activeNode.imageUrl, "pro_source.png");
      const settings = getFixedSettings("qwen", activeNodeDims);

      const formData = new FormData();
      formData.append("image", srcFile);
      formData.append("prompt", prompt);
      formData.append("negative_prompt", negativePrompt);
      formData.append("model", "qwen");
      formData.append("settings", JSON.stringify(settings));

      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt,
        negativePrompt,
        model: "qwen",
        settings,
      };
      pushProNode(newNode);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Операция отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- УПРАВЛЕНИЕ UI И СОСТОЯНИЕМ ---

  const onCancel = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setError("Генерация отменена.");
  };

  const onClear = () => {
    clearFile();
    setError(null);
    setBaseResults([]);
    setSelectedBaseResultUrl(null);
    setCompareSourceUrl(null);
    setActiveNodeId(null);
    setActiveWorkspaceId(null);
    setWorkspaces({});
  };

  const onClearPro = () => {
    setPrompt("");
    setNegativePrompt(NEG_DEFAULT);
    setShowNeg(false);
    setError(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (activeTab === "BASE") onGenerate();
      else onGeneratePro();
    }
    if (e.key === "Escape" && isLoading) onCancel();
  };

  // Промоут последнего BASE-результата в PRO-воркспейс (если вдруг интерфейс захочет)
  const handlePromoteToPro = (nodeId?: string) => {
    const id = nodeId ?? baseResults[baseResults.length - 1]?.id;
    if (!id) return fail("Нет базового результата для продвижения.");
    const nodeToPromote = baseResults.find((n) => n.id === id);
    if (!nodeToPromote) return fail("Базовый узел не найден.");

    if (workspaces[id]) {
      const history = workspaces[id];
      setActiveNodeId(history[history.length - 1].id);
    } else {
      setWorkspaces((prev) => ({ ...prev, [id]: [{ ...nodeToPromote }] }));
      setActiveNodeId(id);
    }
    setActiveWorkspaceId(id);
  };

    

  const handleTabChange = (tab: "BASE" | "PRO") => {
    if (tab === "PRO" && !activeWorkspaceId && baseResults.length > 0) {
      // Авто-переход в PRO на последнем результате, если еще не в воркспейсе
      handlePromoteToPro();
    } else {
      setActiveTab(tab);
    }
  };

  const handleChangeSource = () => {
    setActiveWorkspaceId(null);
    setActiveNodeId(null);
    setActiveTab("BASE");
  };

  const deleteWorkspace = (workspaceId: string) => {
    setWorkspaces((prev) => {
      const next = { ...prev };
      delete next[workspaceId];
      return next;
    });
    if (activeWorkspaceId === workspaceId) {
      setActiveWorkspaceId(null);
      setActiveNodeId(null);
    }
  };

  const deleteBaseResult = (nodeId: string) => {
    setBaseResults((prev) => prev.filter((node) => node.id !== nodeId));
  };

  // --- ВОЗВРАТ ---
  return {
    // files
    sourceFile,
    sourceUrl,
    imageInfo,
    onFileChange,
    onDrop,
    dropRef,

    // промпты и состояние
    rawPrompt,
    setRawPrompt,
    windowView,
    setWindowView,
    doorView,
    setDoorView,
    helperPrompts,
    setHelperPrompts,
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    showNeg,
    setShowNeg,
    promptTokenCount,
    negativeTokenCount,

    // состояние
    isReadyToGenerateBase,
    isReadyToGeneratePro,
    isLoading,
    error,

    // экшены
    onGenerate,
    onGeneratePro,
    onCancel,
    onClear,
    onClearPro,
    onKeyDown,

    // Canvas/Compare
    baseResults,
    selectedBaseResultUrl,
    compareSourceUrl,
    comparePos,
    setComparePos,
    selectBaseResultForCompare: (node: GenerationNode) => {
      setSelectedBaseResultUrl(node.imageUrl);
      setCompareSourceUrl(node.sourceImageUrl);
    },

    // PRO
    workspaces,
    activeHistory,
    activeNode,
    activeNodeDims,
    activeWorkspaceId,
    activeNodeId,
    setActiveNodeId,
    handlePromoteToPro,
    handleChangeSource,
    deleteWorkspace,
    deleteBaseResult, // <<< ВОТ ОНА

    // PRO-генераторы
    onGenerateBackgroundReplacement, // model = 'gemini'
    onGenerateTextureReplacement,    // model = 'gemini' (по брифу)
    onGenerateStyleReplacement,      // model = 'gemini'
    onGenerateObjectInjection,       // model = 'gemini'
    onGenerateObjectInjection3D,     // model = 'gemini'
    onGenerateArrowEdits,            // model = 'seedream'

    // UI
    activeTab,
    handleTabChange,
  };
}
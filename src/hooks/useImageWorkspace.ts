// src/hooks/useImageWorkspace.ts
import { useState, useMemo, useEffect, useRef, ChangeEvent, KeyboardEvent, useCallback } from "react";
import { encode } from "gpt-tokenizer";
import { LlmSettings, Model, GenerationNode } from "@/lib/types";
import { loadPersist, savePersist } from "@/lib/utils";
import * as api from "@/lib/api";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useSettingsManager } from "@/hooks/useSettingsManager";
import { LLM_SYSTEM_PROMPT } from "@/lib/constants";

const defaultLlmSettings: LlmSettings = {
  model: "gpt-5-mini",
  systemPrompt: LLM_SYSTEM_PROMPT,
  temperature: 1.0,
  topP: 1,
  maxCompletionTokens: 2000,
};

const initialLlmSettingsByModel: { [key in Model]?: Partial<LlmSettings> } = {
  gemini: { ...defaultLlmSettings },
  qwen: { ...defaultLlmSettings },
  flux: { ...defaultLlmSettings },
  seedream: { ...defaultLlmSettings },
};

export function useImageWorkspace() {
  const {
    sourceFile,
    sourceUrl,         // <<< Используем для отображения
    sourceDataUrl,     // <<< Используем для сохранения
    imageInfo,
    fileError,
    dropRef,
    onFileChange,
    onDrop,
    clearFile,
  } = useFileHandler();

  const settingsManager = useSettingsManager(imageInfo);

  const [activeTab, setActiveTab] = useState<"BASE" | "PRO">("BASE");
  const [baseResults, setBaseResults] = useState<GenerationNode[]>([]);
  const [selectedBaseResultUrl, setSelectedBaseResultUrl] = useState<string | null>(null);
  const [compareSourceUrl, setCompareSourceUrl] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<{ [rootNodeId: string]: GenerationNode[] }>({});
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [rawPrompt, setRawPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [sendImageToLlm, setSendImageToLlm] = useState(true);
  const [showRefiner, setShowRefiner] = useState(false);
  const [llmSettingsByModel, setLlmSettingsByModel] = useState(initialLlmSettingsByModel);
  const [negativePrompt, setNegativePrompt] = useState("blurry, ugly, deformed, text, watermark");
  const [showNeg, setShowNeg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparePos, setComparePos] = useState(50);
  const [windowView, setWindowView] = useState("a dense Scandinavian forest");
  const [doorView, setDoorView] = useState("a cozy antechamber (changing room)");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [promptTokenCount, setPromptTokenCount] = useState(0);
  const [negativeTokenCount, setNegativeTokenCount] = useState(0);

  useEffect(() => {
    if (fileError) setError(fileError);
  }, [fileError]);

  const activeHistory = useMemo(
    () => workspaces[activeWorkspaceId ?? ""] ?? [],
    [workspaces, activeWorkspaceId]
  );
  const activeNode = useMemo(
    () => activeHistory.find((node) => node.id === activeNodeId) ?? null,
    [activeNodeId, activeHistory]
  );

  const isReadyToGenerate = useMemo(() => {
    if (activeTab === "BASE") return !!sourceFile && !!prompt.trim() && !isLoading;
    return !!activeNode && !!prompt.trim() && !isLoading;
  }, [activeTab, sourceFile, activeNode, prompt, isLoading]);

  const fail = useCallback((msg: string) => {
    setError(msg);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (sourceFile) {
      setError(null);
      // Сбрасываем и результат, и его исходник, чтобы канвас обновился
      setSelectedBaseResultUrl(null);
      setCompareSourceUrl(null); // <<< ВОТ ОНА, НЕДОСТАЮЩАЯ СТРОЧКА
      // Принудительно переключаем на вкладку BASE
      setActiveTab("BASE");
    }
  }, [sourceFile]);

  // persist load
  useEffect(() => {
    const p = loadPersist();
    if (!p) return;
    setBaseResults(p.baseResults ?? []);
    setActiveTab(p.activeTab ?? "BASE");
    setSelectedBaseResultUrl(p.selectedBaseResultUrl ?? null);
    setWorkspaces(p.workspaces ?? {});
    setActiveWorkspaceId(p.activeWorkspaceId ?? null);
    setPrompt(p.prompt ?? "");
    setNegativePrompt(p.negativePrompt ?? "blurry, ugly, deformed, text, watermark");
    if (p.selectedModel) settingsManager.setSelectedModel(p.selectedModel);
    if (p.qwenSettings) settingsManager.setQwenSettings(p.qwenSettings);
    if (p.fluxSettings) settingsManager.setFluxSettings(p.fluxSettings);
    if (p.seedreamSettings) settingsManager.setSeedreamSettings(p.seedreamSettings);
    if (p.llmSettingsByModel) setLlmSettingsByModel(p.llmSettingsByModel);
    if (typeof p.sendImageToLlm === "boolean") setSendImageToLlm(p.sendImageToLlm);
    if (typeof p.showRefiner === "boolean") setShowRefiner(p.showRefiner);
    if (typeof p.showNeg === "boolean") setShowNeg(p.showNeg);
    if (typeof p.seedLock === "boolean") settingsManager.setSeedLock(p.seedLock);
    if (typeof p.comparePos === "number") setComparePos(p.comparePos);
    if (p.seedreamTargetSize) settingsManager.setSeedreamTargetSize(p.seedreamTargetSize);
  }, []);

  // persist save
  useEffect(() => {
    savePersist({
      prompt,
      negativePrompt,
      llmSettingsByModel,
      sendImageToLlm,
      showRefiner,
      showNeg,
      comparePos,
      activeTab,
      baseResults,
      selectedBaseResultUrl,
      workspaces,
      activeWorkspaceId,
      selectedModel: settingsManager.selectedModel,
      qwenSettings: settingsManager.qwenSettings,
      fluxSettings: settingsManager.fluxSettings,
      seedreamSettings: settingsManager.seedreamSettings,
      seedLock: settingsManager.seedLock,
      seedreamTargetSize: settingsManager.seedreamTargetSize,
      tab: "compare", // deprecated
    });
  }, [
    prompt,
    negativePrompt,
    llmSettingsByModel,
    sendImageToLlm,
    showRefiner,
    showNeg,
    comparePos,
    activeTab,
    baseResults,
    selectedBaseResultUrl,
    workspaces,
    activeWorkspaceId,
    settingsManager,
  ]);

  useEffect(() => {
    setPromptTokenCount(encode(prompt || "").length);
    setNegativeTokenCount(encode(negativePrompt || "").length);
  }, [prompt, negativePrompt]);

  useEffect(() => {
    if (selectedBaseResultUrl && !baseResults.some((node) => node.imageUrl === selectedBaseResultUrl)) {
      setSelectedBaseResultUrl(null);
    }
    if (activeWorkspaceId && !workspaces[activeWorkspaceId]) {
      setActiveWorkspaceId(null);
      setActiveNodeId(null);
      setActiveTab("BASE");
    }
  }, [baseResults, workspaces, selectedBaseResultUrl, activeWorkspaceId]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
    if (e.key === "Escape" && isLoading) onCancel();
  };

  const handleLlmSettingsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? parseFloat(value) : value;
    setLlmSettingsByModel((prev) => ({
      ...prev,
      [settingsManager.selectedModel]: {
        ...(prev[settingsManager.selectedModel] ?? {}),
        [name]: parsedValue,
      },
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
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    let base64Image: string | undefined = undefined;
    if (sendImageToLlm && sourceFile) {
      const buffer = await sourceFile.arrayBuffer();
      base64Image = `data:${sourceFile.type};base64,${arrayBufferToBase64(buffer)}`;
    }

    const finalRawPrompt = `${rawPrompt.trim()}\n[VIEW_WINDOW: ${windowView}]\n[VIEW_DOOR: ${doorView}]`;
    const activeSettings = { ...defaultLlmSettings, ...llmSettingsByModel[settingsManager.selectedModel] };
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
      const data = await api.refinePrompt(payload, abortControllerRef.current.signal);
      setPrompt(data.refinedPrompt);
      setShowRefiner(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") setRefineError("Улучшение отменено.");
        else setRefineError(error.message);
      } else {
        setRefineError("Произошла неизвестная ошибка.");
      }
    } finally {
      setIsRefining(false);
    }
  };

  const onGenerate = async () => {
    if (!isReadyToGenerate) return;
    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    let currentImageFile: File;
    let parentId: string | null = null;
    if (activeTab === "BASE") {
      if (!sourceFile) return fail("Нет исходного файла.");
      currentImageFile = sourceFile;
    } else {
      if (!activeNode) return fail("Нет активного узла.");
      parentId = activeNodeId;
      try {
        const response = await fetch(activeNode.imageUrl);
        const blob = await response.blob();
        currentImageFile = new File([blob], "pro_source.png", { type: blob.type });
      } catch {
        return fail("Не удалось загрузить изображение из активного узла.");
      }
    }

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings();

    const formData = new FormData();
    formData.append("image", currentImageFile);
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", settingsManager.selectedModel);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeTab === 'BASE' ? sourceDataUrl : activeNode?.sourceImageUrl ?? null, // <<< ИСПОЛЬЗУЕМ ВЕЧНЫЙ URL
        prompt,
        negativePrompt,
        model: settingsManager.selectedModel,
        settings,
      };
      if (activeTab === 'BASE') {
        setBaseResults(prev => [...prev, newNode]);
        setSelectedBaseResultUrl(newNode.imageUrl);
        setCompareSourceUrl(newNode.sourceImageUrl);
      } else {
        if (!activeWorkspaceId) return fail("Критическая ошибка: нет воркспейса.");
        setWorkspaces((prev) => ({
          ...prev,
          [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
        }));
        setActiveNodeId(newNode.id);
      }
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else {
        setError("Неизвестная ошибка при генерации.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectBaseResultForCompare = (node: GenerationNode | null) => {
    if (node) {
      setSelectedBaseResultUrl(node.imageUrl);
      setCompareSourceUrl(node.sourceImageUrl);
    } else {
      setSelectedBaseResultUrl(null);
      setCompareSourceUrl(null);
    }
  };

  const handleJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (typeof event.target?.result !== "string") throw new Error("Не удалось прочитать файл.");
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
    if (file && file.type === "application/json") handleJsonFile(file);
    else if (file) setJsonError("Неверный тип файла. Нужен JSON.");
    e.target.value = "";
  };

  const onClear = () => {
    clearFile();
    setError(null);
    setActiveNodeId(null);
    setBaseResults([]);
    setSelectedBaseResultUrl(null);
    setActiveTab("BASE");
    settingsManager.setSeedLock(false);
  };

  const onCancel = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setError("Генерация отменена.");
  };

  const handleTabChange = (tab: "BASE" | "PRO") => {
    if (tab === "PRO" && !activeWorkspaceId && baseResults.length > 0) {
      handlePromoteToPro(baseResults[baseResults.length - 1].id);
      return;
    }
    setActiveTab(tab);
  };

  const handleChangeSource = () => {
    setActiveWorkspaceId(null);
    setActiveNodeId(null);
  };

  const handlePromoteToPro = (nodeId: string) => {
    const nodeToPromote = baseResults.find((node) => node.id === nodeId);
    if (!nodeToPromote) return fail("Не удалось найти узел.");
    if (!workspaces[nodeToPromote.id]) {
      setWorkspaces((prev) => ({ ...prev, [nodeToPromote.id]: [nodeToPromote] }));
    }
    setActiveWorkspaceId(nodeToPromote.id);
    setActiveNodeId(nodeToPromote.id);
    setActiveTab("PRO");
  };

  const deleteBaseResult = (nodeId: string) => {
    setBaseResults((prev) => prev.filter((node) => node.id !== nodeId));
  };

  const deleteWorkspace = (workspaceId: string) => {
    setWorkspaces((prev) => {
      const newWorkspaces = { ...prev };
      delete newWorkspaces[workspaceId];
      return newWorkspaces;
    });
    if (activeWorkspaceId === workspaceId) {
      setActiveWorkspaceId(null);
      setActiveNodeId(null);
    }
  };

  return {
    ...settingsManager,
    sourceFile,
    sourceUrl, // <<< ВОЗВРАЩАЕМ БЫСТРЫЙ URL ДЛЯ КАНВАСА
    imageInfo,
    onFileChange,
    onDrop,
    dropRef,
    activeTab,
    handleTabChange,
    handleChangeSource,
    baseResults,
    selectedBaseResultUrl,
    selectBaseResultForCompare,
    compareSourceUrl,
    setSelectedBaseResultUrl,
    handlePromoteToPro,
    activeHistory,
    activeNode,
    activeNodeId,
    setActiveNodeId,
    comparePos,
    setComparePos,
    isLoading,
    error,
    isReadyToGenerate,
    prompt,
    setPrompt,
    rawPrompt,
    setRawPrompt,
    negativePrompt,
    setNegativePrompt,
    promptTokenCount,
    negativeTokenCount,
    isRefining,
    refineError,
    onRefinePrompt,
    sendImageToLlm,
    setSendImageToLlm,
    llmSettingsByModel,
    handleLlmSettingsChange,
    showRefiner,
    setShowRefiner,
    showNeg,
    setShowNeg,
    windowView,
    setWindowView,
    doorView,
    setDoorView,
    jsonContent,
    isJsonViewerOpen,
    setIsJsonViewerOpen,
    jsonError,
    onJsonFileChange,
    onGenerate,
    onClear,
    onCancel,
    onKeyDown,
    deleteBaseResult,
    deleteWorkspace,
  };
}
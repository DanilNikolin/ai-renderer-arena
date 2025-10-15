// src/hooks/useImageWorkspace.ts
import {
  useState,
  useMemo,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  useCallback,
} from "react";
import { encode } from "gpt-tokenizer";
import type { PersistState } from "@/lib/types";
import { loadPersist, savePersist } from "@/lib/utils";
import * as api from "@/lib/api";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useSettingsManager } from "@/hooks/useSettingsManager";
import { LlmSettings, Model, GenerationNode } from "@/lib/types";
import { LLM_SYSTEM_PROMPT } from "@/lib/constants";
import { genId } from "@/lib/id";

/* ---------------- LLM defaults ---------------- */

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

/* ---------------- DTO and /me types ---------------- */

export type WorkspaceStateDTO = {
  activeTab: "BASE" | "PRO";
  comparePos: number;
  selectedBaseResultUrl: string | null;
  activeNodeId: string | null;
  sourceUrl: string | null; // persistent original image URL (MinIO)
  baseResults: Array<{ id: string; imageUrl: string; parentId?: string | null }>;
  workspaces: Record<
    string,
    Array<{ id: string; parentId?: string | null; imageUrl: string }>
  >;
};

type MeResponse =
  | { authenticated: false }
  | {
      authenticated: true;
      projectId: string;
      mode: "local_dev" | "prod";
      accountId: string | null;
    };

/* ---------------- helpers ---------------- */

function debounce<A extends unknown[], R>(
  fn: (...args: A) => R,
  ms: number
): (...args: A) => void {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      void fn(...args);
    }, ms);
  };
}

function dtoToGenNode(n: {
  id: string;
  imageUrl: string;
  parentId?: string | null;
}): GenerationNode {
  return {
    id: n.id,
    parentId: n.parentId ?? null,
    imageUrl: n.imageUrl,
    sourceImageUrl: null,
    prompt: "",
    negativePrompt: "",
    model: "gemini" as Model,
    settings: {} as GenerationNode["settings"],
  } as GenerationNode;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/* ========================================================================== */
/*                                    HOOK                                    */
/* ========================================================================== */

export function useImageWorkspace() {
  const {
    sourceFile,
    sourceUrl, // ephemeral browser URL
    sourceDataUrl,
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

  const [workspaces, setWorkspaces] = useState<Record<string, GenerationNode[]>>({});
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeNodeDims, setActiveNodeDims] = useState<{ w: number; h: number } | null>(
    null
  );

  const [prompt, setPrompt] = useState("");
  const [rawPrompt, setRawPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [sendImageToLlm, setSendImageToLlm] = useState(true);
  const [showRefiner, setShowRefiner] = useState(false);
  const [llmSettingsByModel, setLlmSettingsByModel] = useState(
    initialLlmSettingsByModel
  );
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, ugly, deformed, text, watermark"
  );
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
  const [helperPrompts, setHelperPrompts] = useState({
    background: "",
    style: "",
    texture: "",
    object: "",
  });

  /** Persistent original image URL (MinIO) */
  const [sourcePersistUrl, setSourcePersistUrl] = useState<string | null>(null);

  /** Whether we should save server-side */
  const [isAuthed, setIsAuthed] = useState(false);

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

  /* --- compute dimensions for active PRO node --- */
  useEffect(() => {
    if (!activeNode) {
      setActiveNodeDims(null);
      return;
    }
    const getDimsFromUrl = (url: string): Promise<{ w: number; h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });
    getDimsFromUrl(activeNode.imageUrl)
      .then(setActiveNodeDims)
      .catch(() => setActiveNodeDims(null));
  }, [activeNode]);

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
      setSelectedBaseResultUrl(null);
      setCompareSourceUrl(null);
      setActiveTab("BASE");
    }
  }, [sourceFile]);

  /* ================= Upload original to MinIO (once per file) ================= */
  useEffect(() => {
    let cancelled = false;
    if (!sourceFile) {
      setSourcePersistUrl(null);
      return () => {
        cancelled = true;
      };
    }

    if (!isAuthed) {
      setSourcePersistUrl(null);
      setCompareSourceUrl(sourceDataUrl ?? null);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const fd = new FormData();
        fd.append("file", sourceFile);
        const res = await fetch("/api/files/upload", { method: "POST", body: fd });
        const j = await res.json();

        if (!res.ok) {
          console.error("Upload failed:", j);
          return;
        }
        if (!cancelled) {
          setSourcePersistUrl(j.url as string);
          setCompareSourceUrl(j.url as string);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceFile, isAuthed, sourceDataUrl]);

  /* ======================= Server-first restore (fallback local) ======================= */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const me = (await meRes.json()) as unknown as MeResponse;
        const authed = me.authenticated === true;
        if (cancelled) return;
        setIsAuthed(authed);

        if (authed) {
          const sRes = await fetch("/api/workspace/state", { cache: "no-store" });
          if (!sRes.ok && sRes.status !== 204) throw new Error("state fetch failed");
          if (cancelled) return;

          if (sRes.status === 200) {
            const saved = (await sRes.json()) as unknown as WorkspaceStateDTO;

            const hydratedWorkspaces: Record<string, GenerationNode[]> =
              Object.fromEntries(
                Object.entries(saved.workspaces ?? {}).map(([root, list]) => [
                  root,
                  (list ?? []).map((n) => dtoToGenNode(n)),
                ])
              );

            const hydratedBase: GenerationNode[] = (saved.baseResults ?? []).map((n) =>
              dtoToGenNode(n)
            );

            setWorkspaces(hydratedWorkspaces);
            setBaseResults(hydratedBase);
            setActiveTab(saved.activeTab ?? "BASE");
            setComparePos(
              typeof saved.comparePos === "number" ? saved.comparePos : 50
            );
            setSelectedBaseResultUrl(saved.selectedBaseResultUrl ?? null);
            setActiveNodeId(saved.activeNodeId ?? null);

            setSourcePersistUrl(saved.sourceUrl ?? null);
            if (saved.sourceUrl) setCompareSourceUrl(saved.sourceUrl);
            return;
          }
        }

        /* -------- Local fallback -------- */
        const raw = loadPersist();
        if (!raw || !isObject(raw)) return;
        const p = raw as Partial<PersistState>;

        const loadedWorkspaces =
          (p.workspaces as unknown as Record<string, GenerationNode[]>) ?? {};
        const loadedActiveWorkspaceId = p.activeWorkspaceId ?? null;
        const loadedActiveNodeId = p.activeNodeId ?? null;

        let finalActiveWorkspaceId: string | null = null;
        let finalActiveNodeId: string | null = null;
        let finalActiveTab: "BASE" | "PRO" = p.activeTab ?? "BASE";

        if (
          loadedActiveWorkspaceId &&
          loadedWorkspaces[loadedActiveWorkspaceId] &&
          loadedWorkspaces[loadedActiveWorkspaceId].some(
            (node) => node.id === loadedActiveNodeId
          )
        ) {
          finalActiveWorkspaceId = loadedActiveWorkspaceId;
          finalActiveNodeId = loadedActiveNodeId;
        } else if (finalActiveTab === "PRO") {
          finalActiveTab = "BASE";
        }

        setWorkspaces(loadedWorkspaces);
        setActiveWorkspaceId(finalActiveWorkspaceId);
        setActiveNodeId(finalActiveNodeId);
        setActiveTab(finalActiveTab);

        setBaseResults((p.baseResults as unknown as GenerationNode[]) ?? []);
        setSelectedBaseResultUrl(p.selectedBaseResultUrl ?? null);
        setPrompt(p.prompt ?? "");
        setNegativePrompt(
          p.negativePrompt ?? "blurry, ugly, deformed, text, watermark"
        );

        if (p.sourcePersistUrl) {
          setSourcePersistUrl(p.sourcePersistUrl);
          setCompareSourceUrl(p.sourcePersistUrl);
        }

        const selModel = p.selectedModel as Model | undefined;
        if (selModel) settingsManager.setSelectedModel(selModel);
        if (p.qwenSettings) {
          settingsManager.setQwenSettings(
            p.qwenSettings as typeof settingsManager.qwenSettings
          );
        }
        if (p.fluxSettings) {
          settingsManager.setFluxSettings(
            p.fluxSettings as typeof settingsManager.fluxSettings
          );
        }
        if (p.seedreamSettings) {
          settingsManager.setSeedreamSettings(
            p.seedreamSettings as typeof settingsManager.seedreamSettings
          );
        }
        if (p.llmSettingsByModel) {
          setLlmSettingsByModel(p.llmSettingsByModel as typeof llmSettingsByModel);
        }
        if (typeof p.sendImageToLlm === "boolean")
          setSendImageToLlm(p.sendImageToLlm);
        if (typeof p.showRefiner === "boolean") setShowRefiner(p.showRefiner);
        if (typeof p.showNeg === "boolean") setShowNeg(p.showNeg);
        if (typeof p.seedLock === "boolean") settingsManager.setSeedLock(p.seedLock);
        if (typeof p.comparePos === "number") setComparePos(p.comparePos);
        if (p.seedreamTargetSize) {
          settingsManager.setSeedreamTargetSize(
            p.seedreamTargetSize as typeof settingsManager.seedreamTargetSize
          );
        }
      } catch {
        /* ignore; UI remains usable */
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============================== Save snapshot ============================== */

  const snapshot = useMemo<WorkspaceStateDTO>(
    () => ({
      activeTab,
      comparePos,
      selectedBaseResultUrl,
      activeNodeId,
      sourceUrl: sourcePersistUrl,
      baseResults: baseResults.map((n) => ({
        id: n.id,
        imageUrl: n.imageUrl,
        parentId: n.parentId ?? null,
      })),
      workspaces: Object.fromEntries(
        Object.entries(workspaces).map(([root, list]) => [
          root,
          list.map((n) => ({
            id: n.id,
            imageUrl: n.imageUrl,
            parentId: n.parentId ?? null,
          })),
        ])
      ),
    }),
    [
      activeTab,
      comparePos,
      selectedBaseResultUrl,
      activeNodeId,
      sourcePersistUrl,
      baseResults,
      workspaces,
    ]
  );

  const saveServerDebounced = useMemo(
    () =>
      debounce(async (state: WorkspaceStateDTO) => {
        try {
          await fetch("/api/workspace/state", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state }),
          });
        } catch {
          /* ignore transient failures */
        }
      }, 800),
    []
  );

  useEffect(() => {
    if (isAuthed) {
      saveServerDebounced(snapshot);
    } else {
      const payload: PersistState = {
        prompt,
        negativePrompt,
        llmSettingsByModel,
        sendImageToLlm,
        showRefiner,
        showNeg,
        comparePos: snapshot.comparePos,
        activeTab: snapshot.activeTab,
        baseResults,
        selectedBaseResultUrl: snapshot.selectedBaseResultUrl,
        workspaces,
        activeWorkspaceId,
        activeNodeId: snapshot.activeNodeId,
        activeNodeDims,
        selectedModel: settingsManager.selectedModel,
        qwenSettings: settingsManager.qwenSettings,
        fluxSettings: settingsManager.fluxSettings,
        seedreamSettings: settingsManager.seedreamSettings,
        seedLock: settingsManager.seedLock,
        seedreamTargetSize: settingsManager.seedreamTargetSize,
        tab: "compare",
        sourcePersistUrl,
      };
      savePersist(payload);
    }
  }, [
    snapshot,
    prompt,
    negativePrompt,
    llmSettingsByModel,
    sendImageToLlm,
    showRefiner,
    showNeg,
    activeWorkspaceId,
    activeNodeDims,
    settingsManager.selectedModel,
    settingsManager.qwenSettings,
    settingsManager.fluxSettings,
    settingsManager.seedreamSettings,
    settingsManager.seedLock,
    settingsManager.seedreamTargetSize,
    isAuthed,
    saveServerDebounced,
    baseResults,
    workspaces,
    sourcePersistUrl,
  ]);

  /* ============================== misc effects ============================== */

  useEffect(() => {
    setPromptTokenCount(encode(prompt || "").length);
    setNegativeTokenCount(encode(negativePrompt || "").length);
  }, [prompt, negativePrompt]);

  useEffect(() => {
    if (
      selectedBaseResultUrl &&
      !baseResults.some((node) => node.imageUrl === selectedBaseResultUrl)
    ) {
      setSelectedBaseResultUrl(null);
    }
    if (activeWorkspaceId && !workspaces[activeWorkspaceId]) {
      setActiveWorkspaceId(null);
      setActiveNodeId(null);
      setActiveTab("BASE");
    }
  }, [baseResults, workspaces, selectedBaseResultUrl, activeWorkspaceId]);

  /* ============================== UI handlers ============================== */

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
    if (e.key === "Escape" && isLoading) onCancel();
  };

  const onGenerateTextureReplacement = async (
    targetMapFile: File,
    textureFile: File,
    model: "gemini" | "seedream"
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    const basePrompt = `The source image contains a prominent red arrow pointing to a target object. The reference image contains a texture. Your task is to replace the texture of the object indicated by the arrow with the texture from the reference image.
Crucially:
1. The red arrow must be completely removed from the final result.
2. Preserve the MACRO-geometry: the overall shape of the object, as well as the scene's lighting and shadows.
3. Preserve the MICRO-geometry: If the target object is made of individual components like planks, boards, or tiles, you MUST maintain the original seams, gaps, and grooves between them. The new texture should be applied to each individual component, not to the object as a single flat surface.`;
    const userClarification = helperPrompts.texture.trim();
    const promptText = userClarification
      ? `${basePrompt} A user has provided this clarification: "${userClarification}".`
      : basePrompt;
    const neg = "red arrow, pointer, indicator";

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model);

    const formData = new FormData();
    formData.append("image", targetMapFile);
    formData.append("reference_image", textureFile);
    formData.append("prompt", promptText);
    formData.append("negative_prompt", neg);
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(
        formData,
        abortControllerRef.current!.signal
      );
      const newNode: GenerationNode = {
        id: genId(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt: promptText,
        negativePrompt: neg,
        model,
        settings,
      };
      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else setError("Неизвестная ошибка при генерации.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateObjectInjection3D = async (
    targetMapFile: File,
    referenceObjectFile: File,
    helperPrompt: string
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    
    const model = 'gemini';

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    let promptText = `Place the object from the reference image into the solid red area on the main image. For a seamless integration, you MUST adapt the object to the scene by perfectly matching its lighting, shadows, and PERSPECTIVE. You are permitted to slightly alter the object's original angle if it's necessary to achieve photorealism and correct alignment with the scene's geometry. CRITICAL INSTRUCTION: The red area is a placement marker ONLY. It MUST be completely removed and invisible in the final image.`;
    if (helperPrompt.trim()) {
      promptText += ` An additional user hint is: "${helperPrompt.trim()}".`;
    }
    
    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model);

    const formData = new FormData();
    formData.append("image", targetMapFile);
    formData.append("reference_image", referenceObjectFile);
    formData.append("prompt", promptText);
   
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(formData, abortControllerRef.current!.signal);
      const newNode: GenerationNode = {
        id: crypto.randomUUID(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt: promptText,
        negativePrompt: '', 
        model,
        settings,
      };

      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateStyleReplacement = async (
    referenceFile: File | null,
    model: "gemini" | "seedream"
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    const getDimsFromUrl = (url: string): Promise<{ w: number; h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });
    const activeNodeDimsLocal = await getDimsFromUrl(activeNode.imageUrl);

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    // (Пациент №1): строго promptText
    let promptText: string;
    const userClarification = helperPrompts.style.trim();

    if (referenceFile) {
      const basePrompt = `Redraw the source image (image 1), adhering to two strict rules:
1.  **PRESERVE:** You must preserve ONLY the geometry and composition of the source image.
2.  **TRANSFER:** You must transfer the style from the reference image (image 2) down to the smallest detail, including its exact color palette, lighting scheme, and surface textures.`;
      promptText = userClarification
        ? `${basePrompt}\nAdditional user hint: "${userClarification}".`
        : basePrompt;
    } else if (userClarification) {
      promptText = `Redraw the source image to perfectly match the following style: "${userClarification}".
CRITICAL RULE: Preserve ONLY the geometry and composition of the source image. The final result must match the described style down to the smallest detail in terms of color, lighting, and texture.`;
    } else {
      return fail("Не указан ни файл-референс, ни текстовое описание стиля.");
    }

    let sourceImageFile: File;
    try {
      const response = await fetch(activeNode.imageUrl);
      const blob = await response.blob();
      sourceImageFile = new File([blob], "pro_source.png", { type: blob.type });
    } catch {
      return fail("Не удалось загрузить изображение из активного узла.");
    }

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model, activeNodeDimsLocal);

    const formData = new FormData();
    formData.append("image", sourceImageFile);
    if (referenceFile) formData.append("reference_image", referenceFile);
    formData.append("prompt", promptText);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(
        formData,
        abortControllerRef.current!.signal
      );
      const newNode: GenerationNode = {
        id: genId(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt: promptText,
        negativePrompt,
        model,
        settings,
      };
      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else setError("Неизвестная ошибка при генерации.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateBackgroundReplacement = async (
    referenceFile: File | null,
    targets: { window: boolean; door: boolean },
    model: "gemini" | "seedream"
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    const getDimsFromUrl = (url: string): Promise<{ w: number; h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });
    const activeNodeDimsLocal = await getDimsFromUrl(activeNode.imageUrl);

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    const areas: string[] = [];
    if (targets.window) areas.push("the windows");
    if (targets.door) areas.push("the glass door");
    const promptTarget = areas.join(" and ");
    if (!promptTarget) return fail("Не выбраны цели для замены фона.");

    // (Пациент №2): замена блока на явный promptText
    let promptText: string;
    const userClarification = helperPrompts.background.trim();

    if (referenceFile) {
      const basePrompt = `In the source image, replace the background seen through ${promptTarget} with the scene from the reference image. The new background must be organically integrated. Adapt the lighting and color tones inside the sauna to realistically match the new background. Preserve the original sauna's interior geometry.`;
      promptText = userClarification
        ? `${basePrompt} User clarification: "${userClarification}".`
        : basePrompt;
    } else if (userClarification) {
      promptText = `In the source image, replace the background seen through ${promptTarget} with the following scene: "${userClarification}". Make it photorealistic and organically integrated. Adapt the lighting and color tones inside the sauna to realistically match the new background. Preserve the original sauna's interior geometry.`;
    } else {
      return fail("Не указан ни файл-референс, ни текстовое описание фона.");
    }

    let sourceImageFile: File;
    try {
      const response = await fetch(activeNode.imageUrl);
      const blob = await response.blob();
      sourceImageFile = new File([blob], "pro_source.png", { type: blob.type });
    } catch {
      return fail("Не удалось загрузить изображение из активного узла.");
    }

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model, activeNodeDimsLocal);

    const formData = new FormData();
    formData.append("image", sourceImageFile);
    if (referenceFile) formData.append("reference_image", referenceFile);
    formData.append("prompt", promptText);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(
        formData,
        abortControllerRef.current!.signal
      );
      const newNode: GenerationNode = {
        id: genId(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt: promptText,
        negativePrompt,
        model,
        settings,
      };
      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else setError("Неизвестная ошибка при генерации.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateObjectInjection = async (
    targetMapFile: File,
    objectFile: File,
    model: "gemini" | "seedream"
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    const getDimsFromUrl = (url: string): Promise<{ w: number; h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });
    const activeNodeDimsLocal = await getDimsFromUrl(activeNode.imageUrl);

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    const basePrompt =
      "Seamlessly integrate the object from the reference image into the source image at the location indicated by the red arrow. The arrow must be completely removed from the final result. Match the lighting, shadows, and perspective of the source image to ensure the object looks natural in the environment.";
    const userClarification = helperPrompts.object.trim();
    const promptText = userClarification
      ? `${basePrompt} A user has provided this clarification: "${userClarification}".`
      : basePrompt;
    const neg = "red arrow, pointer, indicator";

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model, activeNodeDimsLocal);

    const formData = new FormData();
    formData.append("image", targetMapFile);
    formData.append("reference_image", objectFile);
    formData.append("prompt", promptText);
    formData.append("negative_prompt", neg);
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(
        formData,
        abortControllerRef.current!.signal
      );
      const newNode: GenerationNode = {
        id: genId(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt: promptText,
        negativePrompt: neg,
        model,
        settings,
      };
      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else setError("Неизвестная ошибка при генерации.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateArrowEdits = async (
    imageBlob: Blob,
    instructionsText: string,
    model: "gemini" | "seedream"
  ) => {
    if (!activeNode) return fail("Нет активного узла для доработки.");
    if (!instructionsText.trim()) return fail("Нет инструкций для выполнения.");

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    // (Пациент №3) — оставляем ТОЛЬКО этот блок
    // 1) Карту правок превращаем в файл
    const imageFile = new File([imageBlob], "arrow_edit_map.png", {
      type: "image/png",
    });

    // 2) Промт с нумерацией
    const instructionsArray = instructionsText
      .split(",")
      .map((instr) => instr.trim())
      .filter((instr) => instr.length > 0);

    const formattedInstructions = instructionsArray
      .map((instr, index) => `${index + 1}. ${instr}`)
      .join("\n");

    const promptText = `Execute the following numbered instructions at the locations indicated by the corresponding red arrows.

Instructions:
${formattedInstructions}

CRITICAL: After applying all edits, you MUST remove all red arrows, numbers, and text annotations from the final image. The output should be a clean photograph.`;

    // 3) Фикс размеров Seedream/и т.п.
    const getDimsFromUrl = (url: string): Promise<{ w: number; h: number }> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = rej;
        img.src = url;
      });
    const activeNodeDimsLocal = await getDimsFromUrl(activeNode.imageUrl);

    settingsManager.updateSeedForGeneration();
    const settings = settingsManager.getCurrentSettings(model, activeNodeDimsLocal);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("prompt", promptText);
    formData.append(
      "negative_prompt",
      "text, annotations, arrows, indicators, pointers"
    );
    formData.append("model", model);
    formData.append("settings", JSON.stringify(settings));

    try {
      const data = await api.generateImage(
        formData,
        abortControllerRef.current!.signal
      );
      const newNode: GenerationNode = {
        id: genId(),
        parentId: activeNodeId,
        imageUrl: data.imageUrl,
        sourceImageUrl: activeNode.sourceImageUrl,
        prompt: promptText,
        negativePrompt: "text, annotations, arrows, indicators, pointers",
        model,
        settings,
      };
      if (!activeWorkspaceId) return fail("Критическая ошибка: нет активного воркспейса.");
      setWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: [...(prev[activeWorkspaceId] ?? []), newNode],
      }));
      setActiveNodeId(newNode.id);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setError("Генерация отменена.");
        else setError(e.message);
      } else setError("Неизвестная ошибка при генерации.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLlmSettingsChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    const activeSettings = {
      ...defaultLlmSettings,
      ...llmSettingsByModel[settingsManager.selectedModel],
    };
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
      const data = await api.refinePrompt(
        payload,
        abortControllerRef.current.signal
      );
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
        currentImageFile = new File([blob], "pro_source.png", {
          type: blob.type,
        });
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
      const data = await api.generateImage(
        formData,
        abortControllerRef.current!.signal
      );
      const newNode: GenerationNode = {
        id: genId(),
        parentId,
        imageUrl: data.imageUrl,
        sourceImageUrl:
          activeTab === "BASE"
            ? sourcePersistUrl ?? sourceDataUrl
            : activeNode?.sourceImageUrl ?? null,
        prompt,
        negativePrompt,
        model: settingsManager.selectedModel,
        settings,
      };
      if (activeTab === "BASE") {
        setBaseResults((prev) => [...prev, newNode]);
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
        if (typeof event.target?.result !== "string")
          throw new Error("Не удалось прочитать файл.");
        const parsed = JSON.parse(event.target.result);
        setJsonContent(JSON.stringify(parsed, null, 2));
        setJsonError(null);
        setIsJsonViewerOpen(true);
      } catch {
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
    if (!nodeToPromote)
      return fail("Критическая ошибка: не найден базовый узел для 'продвижения'.");

    if (workspaces[nodeId]) {
      const history = workspaces[nodeId];
      setActiveNodeId(history[history.length - 1].id);
    } else {
      const clonedRootNode = { ...nodeToPromote } as GenerationNode;
      setWorkspaces((prev) => ({ ...prev, [nodeId]: [clonedRootNode] }));
      setActiveNodeId(nodeId);
    }

    setActiveWorkspaceId(nodeId);
    setActiveTab("PRO");
  };

  const deleteBaseResult = (nodeId: string) => {
    setBaseResults((prev) => prev.filter((node) => node.id !== nodeId));
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
      setActiveTab("BASE");
    }
  };

  /* ---------------- expose API ---------------- */

  return {
    ...settingsManager,
    sourceFile,
    sourceUrl,
    imageInfo,
    activeNodeDims,
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
    workspaces,
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
    onGenerateBackgroundReplacement,
    onGenerateTextureReplacement,
    onGenerateStyleReplacement,
    onGenerateObjectInjection,
    onGenerateArrowEdits,
    onClear,
    onCancel,
    onKeyDown,
    deleteBaseResult,
    helperPrompts,
    setHelperPrompts,
    onGenerateObjectInjection3D,
    deleteWorkspace,
  };
}

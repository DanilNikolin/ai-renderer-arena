"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
} from "react";

/** ---------- types & const ---------- */
type Model = "gemini" | "qwen" | "flux";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type QwenSettings = { guidance_scale: number; num_inference_steps: number; seed: number };
type FluxSettings = { guidance_scale: number; safety_tolerance: number; seed: number };

type LlmModel = 'gpt-5-mini' | 'gpt-5-nano';

type LlmSettings = {
  model: LlmModel;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxCompletionTokens: number;
};

type PersistState = {
  prompt: string;
  negativePrompt: string;
  selectedModel: Model;
  qwenSettings: QwenSettings;
  fluxSettings: FluxSettings;

  // NEW — сохраняем LLM и вспомогательные флаги/вкладки
  llmSettings: LlmSettings;
  sendImageToLlm: boolean;
  showRefiner: boolean;
  showNeg: boolean;
  seedLock: boolean;
  tab: "source" | "result" | "compare";
  comparePos: number;
};

/** ---------- utils ---------- */
function cx(...s: (string | false | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

function readImageDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

function loadPersist(): PersistState | null {
  try {
    const raw = localStorage.getItem("image_workspace_v2");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePersist(s: PersistState) {
  try {
    localStorage.setItem("image_workspace_v2", JSON.stringify(s));
  } catch {}
}

/** ---------- small UI atoms ---------- */
const Label: React.FC<{ title: string; right?: React.ReactNode; className?: string }> = ({ title, right, className }) => (
  <div className={cx("flex items-center justify-between mb-1.5", className)}>
    <span className="text-xs text-gray-300">{title}</span>
    {right}
  </div>
);

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  info?: string;
  name: string;
}> = ({ label, value, min, max, step, onChange, info, name }) => (
  <label className="block space-y-1">
    <Label
      title={label}
      right={
        <input
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          name={name}
          className="w-20 bg-gray-900 border border-gray-700 rounded p-1.5 text-xs text-center"
        />
      }
    />
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      name={name}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
    {info && <p className="text-[10px] text-gray-500">{info}</p>}
  </label>
);

/** ---------- main ---------- */
export default function ImageWorkspace() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [rawPrompt, setRawPrompt] = useState(""); // <-- Для "мусорного" промта
  const [isRefining, setIsRefining] = useState(false); // <-- Загрузка LLM
  const [refineError, setRefineError] = useState<string | null>(null); // <-- Ошибка LLM
  const [sendImageToLlm, setSendImageToLlm] = useState(true); // <-- Состояние чекбокса
  const [showRefiner, setShowRefiner] = useState(false); // <-- Для сворачивания блока
  const [llmSettings, setLlmSettings] = useState<LlmSettings>({
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
  });
  const [negativePrompt, setNegativePrompt] = useState("blurry, ugly, deformed, text, watermark");
  const [showNeg, setShowNeg] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ w: number; h: number } | null>(null);
  const [tab, setTab] = useState<"source" | "result" | "compare">("source");
  const [comparePos, setComparePos] = useState(50); // %
  const [seedLock, setSeedLock] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const dropRef = useRef<HTMLLabelElement | null>(null);

  // settings
  const [qwenSettings, setQwenSettings] = useState<QwenSettings>({
    guidance_scale: 4,
    num_inference_steps: 30,
    seed: 0,
  });
  const [fluxSettings, setFluxSettings] = useState<FluxSettings>({
    guidance_scale: 3.5,
    safety_tolerance: 2,
    seed: 0,
  });

  const handleQwenChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQwenSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };
  const handleFluxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFluxSettings((p) => ({ ...p, [e.target.name]: Number(e.target.value) }));
  };

  // persist
  useEffect(() => {
  const p = loadPersist();
  if (!p) return;

  setPrompt(p.prompt ?? "");
  setNegativePrompt(p.negativePrompt ?? "blurry, ugly, deformed, text, watermark");
  setSelectedModel(p.selectedModel ?? "flux");
  setQwenSettings(p.qwenSettings ?? { guidance_scale: 4, num_inference_steps: 30, seed: 0 });
  setFluxSettings(p.fluxSettings ?? { guidance_scale: 3.5, safety_tolerance: 2, seed: 0 });

  // NEW — безопасно подхватываем, если уже сохранено
  if (p.llmSettings) setLlmSettings(p.llmSettings);
  if (typeof p.sendImageToLlm === "boolean") setSendImageToLlm(p.sendImageToLlm);
  if (typeof p.showRefiner === "boolean") setShowRefiner(p.showRefiner);
  if (typeof p.showNeg === "boolean") setShowNeg(p.showNeg);
  if (typeof p.seedLock === "boolean") setSeedLock(p.seedLock);
  if (p.tab) setTab(p.tab);
  if (typeof p.comparePos === "number") setComparePos(p.comparePos);
}, []);


  useEffect(() => {
  savePersist({
    prompt,
    negativePrompt,
    selectedModel,
    qwenSettings,
    fluxSettings,

    // NEW — добавили всё, что хотим сохранять
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

  // NEW — deps для автосейва
  llmSettings,
  sendImageToLlm,
  showRefiner,
  showNeg,
  seedLock,
  tab,
  comparePos,
]);


  // revoke URL
  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  // keyboard shortcuts
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
      const chunkSize = 0x8000; // 32KB пакетами
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
        if (e.name === "AbortError") {
          setRefineError("Улучшение отменено.");
        } else {
          setRefineError(e.message);
        }
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
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return fail(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return fail("Неверный тип файла. Используйте PNG, JPEG или WebP.");
    }
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

  useEffect(() => {
    const handler = (ev: ClipboardEvent) => onPaste(ev);
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, []);

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
    setTab("source");
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

    // если сид не залочен — подкинем новый для разнообразия
    if (!seedLock) {
      const seed = Math.floor(Math.random() * 2_147_483_647);
      if (selectedModel === "flux") {
        settings = { ...settings, seed };
        setFluxSettings((p) => ({ ...p, seed }));
      }
      if (selectedModel === "qwen") {
        settings = { ...settings, seed };
        setQwenSettings((p) => ({ ...p, seed }));
      }
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
        if (e.name === "AbortError") {
          setError("Генерация отменена.");
        } else {
          setError(e.message);
        }
      } else {
        setError("Произошла неизвестная ошибка.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6" onKeyDown={onKeyDown} tabIndex={0}>
      {/* ---------- Sidebar ---------- */}
      <aside className="bg-gray-850 border border-gray-800 rounded-xl p-4 lg:p-5 sticky top-6 h-fit">
        {/* file */}
        <div className="space-y-2">
          <Label
            title="Исходное изображение"
            right={
              imageInfo && (
                <span className="text-[10px] text-gray-500">
                  {imageInfo.w}×{imageInfo.h}px
                </span>
              )
            }
          />
          <label
            ref={dropRef}
            htmlFor="image-upload"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className={cx(
              "group border border-dashed rounded-lg p-4 text-center cursor-pointer transition",
              "border-gray-700 hover:border-cyan-500 bg-gray-900/50"
            )}
            title="Перетащи файл или кликни. Можно также вставить из буфера Ctrl+V."
          >
            {sourceFile ? (
              <div className="text-left space-y-1">
                <p className="text-cyan-400 text-sm font-medium truncate">{sourceFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(sourceFile.size / 1024 / 1024).toFixed(2)} MB • {sourceFile.type.replace("image/", "").toUpperCase()}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Перетащи или нажми, чтобы выбрать</p>
                <p className="text-xs text-gray-500">PNG, JPEG, WebP • до {MAX_FILE_SIZE_MB}MB • Ctrl+V из буфера</p>
              </div>
            )}
            <input id="image-upload" type="file" className="hidden" accept={ACCEPTED_FILE_TYPES.join(",")} onChange={onFileChange} />
          </label>
        </div>


        {/* prompt refiner */}
        <div className="mt-5 space-y-3 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
          <button type="button" onClick={() => setShowRefiner(v => !v)} className="w-full text-left text-sm font-medium text-cyan-400">
            {showRefiner ? "▼ Скрыть «Промпт-Инженер»" : "► Открыть «Промпт-Инженер»"}
          </button>
          {showRefiner && (
            <div className="pt-2 space-y-4">
              <div>
                <Label title="1. Сообщение для LLM" />
                <textarea
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Опиши задачу простыми словами (напр.: стены кедр, лавки осина)"
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                />
              </div>

              <div>
                <Label title="2. Системный промпт для LLM" />
                <textarea
                  name="systemPrompt"
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={llmSettings.systemPrompt}
                  onChange={handleLlmSettingsChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label title="Модель" />
                  <div className="flex items-center gap-2 rounded-lg bg-gray-950 p-1">
                    {(['gpt-5-mini', 'gpt-5-nano'] as const).map((model) => (
                      <button
                        key={model}
                        onClick={() => setLlmSettings(p => ({ ...p, model }))}
                        className={`w-full px-2 py-1 text-xs rounded-md transition-colors ${
                          llmSettings.model === model ? 'bg-cyan-600 text-white' : 'hover:bg-gray-800'
                        }`}
                      >
                        {model.replace('gpt-5-', 'GPT-5 ')}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex flex-col justify-end items-start gap-2 text-xs text-gray-400 cursor-pointer">
                  <Label title="Контекст" />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sendImageToLlm}
                      onChange={(e) => setSendImageToLlm(e.target.checked)}
                      className="accent-cyan-500"
                      disabled={!sourceFile}
                    />
                    Отправить картинку
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-gray-800 space-y-4">
                <Slider label="Temperature" name="temperature" value={llmSettings.temperature} min={0} max={2} step={0.1} onChange={handleLlmSettingsChange} />
                <Slider label="Top P" name="topP" value={llmSettings.topP} min={0} max={1} step={0.05} onChange={handleLlmSettingsChange} />
                <Slider label="Max Tokens" name="maxCompletionTokens" value={llmSettings.maxCompletionTokens} min={50} max={1000} step={10} onChange={handleLlmSettingsChange} />
              </div>

              <div className="text-center">
                <button
                  onClick={onRefinePrompt}
                  disabled={!rawPrompt.trim() || isRefining}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-md bg-cyan-700 hover:bg-cyan-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isRefining ? "Улучшаю..." : "✓ Улучшить и применить промпт"}
                </button>
              </div>

              {refineError && (
                <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded-md">{refineError}</p>
              )}
            </div>
          )}
        </div>

        {/* prompt */}
        <div className="mt-5 space-y-2">
          <Label
            title="Инструкция"
            right={
              <span className="text-[10px] text-gray-500">{prompt.trim().length || 0}</span>
            }
          />
          <textarea
            rows={5}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Напр.: Change the walls to photorealistic Canadian cedar..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowNeg((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-200 transition underline underline-offset-4"
          >
            {showNeg ? "Скрыть негативный промпт" : "Показать негативный промпт"}
          </button>

          {showNeg && (
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Что НЕ нужно видеть"
            />
          )}
        </div>

        {/* model */}
        <div className="mt-5 space-y-2">
          <Label title="Модель" />
          <div className="grid grid-cols-3 gap-3">
            {(["flux", "qwen", "gemini"] as Model[]).map((m) => {
              const isActive = selectedModel === m;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedModel(m)}
                  className={cx(
                    "py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* settings */}
        <div className="mt-5 pt-4 border-t border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-200">Параметры</h3>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-gray-400">
                <input
                  type="checkbox"
                  checked={seedLock}
                  onChange={(e) => setSeedLock(e.target.checked)}
                  className="accent-cyan-500"
                />
                Фиксировать seed
              </label>
              <button
                type="button"
                onClick={randomizeSeed}
                className="text-[11px] px-2 py-1 rounded border border-gray-700 text-gray-300 hover:bg-gray-800"
                title="Случайный seed"
              >
                🎲
              </button>
            </div>
          </div>

          {selectedModel === "qwen" && (
            <>
              <Slider label="Guidance scale" value={qwenSettings.guidance_scale} min={1} max={10} step={0.1} onChange={handleQwenChange} name="guidance_scale" />
              <Slider label="Inference Steps" value={qwenSettings.num_inference_steps} min={10} max={60} step={1} onChange={handleQwenChange} name="num_inference_steps" />
              <Slider label="Seed" value={qwenSettings.seed} min={0} max={2147483647} step={1} onChange={handleQwenChange} name="seed" />
            </>
          )}

          {selectedModel === "flux" && (
            <>
              <Slider label="Guidance scale (CFG)" value={fluxSettings.guidance_scale} min={0} max={10} step={0.1} onChange={handleFluxChange} name="guidance_scale" />
              <Slider label="Safety Tolerance" value={fluxSettings.safety_tolerance} min={0} max={10} step={0.5} onChange={handleFluxChange} name="safety_tolerance" info="Большее — строже safety и потенциальный кроп." />
              <Slider label="Seed" value={fluxSettings.seed} min={0} max={2147483647} step={1} onChange={handleFluxChange} name="seed" />
            </>
          )}

          {selectedModel === "gemini" && <p className="text-xs text-gray-500">Для Gemini пока нет доп. параметров.</p>}
        </div>

        {/* actions */}
        <div className="mt-5 space-y-3">
          <button
            onClick={onGenerate}
            disabled={!isReadyToGenerate}
            className={cx(
              "w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition",
              isReadyToGenerate ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"
            )}
            title="Ctrl/Cmd+Enter — тоже сработает"
          >
            {isLoading ? "Генерация..." : "Сгенерировать"}
          </button>

          <div className="flex items-center justify-between">
            {isLoading ? (
              <button onClick={onCancel} className="text-xs text-red-400 hover:text-red-300">
                Отменить (Esc)
              </button>
            ) : (
              <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-200">
                Очистить
              </button>
            )}
            {sourceFile && (
              <span className="text-[11px] text-gray-500">{sourceFile.type.replace("image/", "").toUpperCase()}</span>
            )}
          </div>

          {error && (
            <div className="text-red-300 text-xs bg-red-900/20 border border-red-800/40 rounded p-2">
              <p className="font-semibold">Ошибка</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ---------- Canvas ---------- */}
      <section className="space-y-4">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {isLoading ? "Обработка…" : resultUrl ? "Готово" : "Ожидает запуска"}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-1 flex">
              {(["source", "result", "compare"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cx(
                    "px-3 py-1.5 text-xs rounded-md",
                    tab === t ? "bg-gray-800 text-gray-100" : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  {t === "source" ? "Исходник" : t === "result" ? "Результат" : "Сравнить"}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!sourceUrl || !sourceFile) return;
                const link = document.createElement("a");
                link.href = sourceUrl;
                link.download = sourceFile.name || "source.png";
                link.click();
              }}
              disabled={!sourceUrl}
              className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
            >
              Скачать исходник
            </button>

            <button
              onClick={() => {
                if (!resultUrl) return;
                const link = document.createElement("a");
                link.href = resultUrl;
                link.download = "result.png";
                link.click();
              }}
              disabled={!resultUrl}
              className="text-xs px-2.5 py-1.5 rounded border border-gray-800 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
            >
              Скачать результат
            </button>
          </div>
        </div>

        {/* canvases */}
        <div className="bg-gray-850 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-800 text-xs text-gray-400">
            {tab === "source" ? "Исходное изображение" : tab === "result" ? "Результат" : "Сравнение (двигай слайдер)"}
          </div>

          <div className="relative h-[60vh] md:h-[70vh] bg-gray-900">

            {/* loading overlay */}
            {isLoading && <div className="absolute inset-0 bg-gray-800/50 animate-pulse" aria-label="loading" />}

            {/* source */}
            {tab !== "result" && (
              sourceUrl ? (
                <img src={sourceUrl} alt="Source" className="absolute inset-0 w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">Загрузите изображение</div>
              )
            )}

            {/* result */}
            {tab !== "source" && (
              resultUrl ? (
                tab === "compare" ? (
                  <>
                    <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain" style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }} />
                    <div className="absolute inset-0 pointer-events-none border-l-2 border-cyan-500" style={{ left: `${comparePos}%` }} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={comparePos}
                      onChange={(e) => setComparePos(Number(e.target.value))}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[60%] h-2 bg-gray-700 rounded-lg appearance-none accent-cyan-500"
                    />
                  </>
                ) : (
                  <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain" />
                )
              ) : (
                tab !== "source" && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">Пока пусто</div>
                )
              )
            )}
          </div>
        </div>

        <div className="text-[11px] text-gray-500">
          Лайфхак: короткий промпт → выбери модель → Ctrl/Cmd+Enter. Вставка из буфера работает.
        </div>
      </section>
    </div>
  );
}
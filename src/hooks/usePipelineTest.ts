// src/hooks/usePipelineTest.ts
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useFileHandler } from "@/hooks/useFileHandler";
import * as api from "@/lib/api";

// --- ИСПРАВЛЕННЫЙ СИСТЕМНЫЙ ПРОМТ (НОВЫЕ ТЕГИ) ---
const STEP_BASED_SYSTEM_PROMPT = `You are a 'Prompt Dispatcher' AI. Your task is to analyze a raw user request (a dirty prompt + an image of a sauna) and generate TWO separate, specialized prompts for a two-step pipeline.

The user's request will include [VIEW_WINDOW: ...] and [VIEW_DOOR: ...] contexts. You must pass these contexts into the placeholders {windowView} and {doorView}.

Your output MUST contain two blocks marked with the ::TAG_START:: and ::TAG_END:: markers.

---
[TASK 1: PROMPT FOR STEP 1 (Qwen Base)]
Generate a prompt inside ::STEP1_START::...::STEP1_END:: markers. This prompt MUST be a direct, concise command list for the Artist AI (Qwen).

**Instructions for you (the Dispatcher AI):**
1.  **Start** the prompt with the mandatory line: "Maintain precise geometry, proportions, and camera FOV."
2.  **Analyze** the sketch for colored areas based on the "Golden Rule" (Red=Door, Green=Window, Blue=Floor-to-Ceiling Window).
3.  **Generate fill commands:** For each colored area you find, add a new line to the prompt based on these rules:
    * 🚪 **If Red area (Door) is found:**
        * If fully filled red: Add line: "Red area (doorway) = a transparent glass door leading into {doorView}."
        * If partially filled (glass insert): Add line: "Red area (doorway) = a [door material] door with a transparent glass insert viewing {doorView}."
    * 🟦/🟩 **If Blue/Green areas (Windows) are found:**
        * If Blue area on [position]: Add line: "Blue area on the [position] (window opening) = a large transparent floor-to-ceiling glass window viewing {windowView}."
        * If Green area on [position]: Add line: "Green area on the [position] (window opening) = a photorealistic transparent glass window viewing {windowView}."
        * (Handle combined cases by adding separate lines for each).
4.  **Constraint:** Do NOT add any instructions about materials (wood, stone) or general lighting.
5.  **End** the prompt with the mandatory line: "All filled areas must look organic, photorealistic, and perfectly match the scene's perspective."

---
[TASK 2: PROMPT FOR STEP 2 (Qwen Final)]
Generate a prompt inside ::STEP2_START::...::STEP2_END:: markers. This prompt assumes the openings are *already filled*.

1.  **Start (Mandatory):** "Maintain precise geometry, proportions, and camera FOV."
2.  **General Quality:** "Completely redraw the entire image, replacing all placeholder textures with hyper-realistic, detailed materials. The final image must be photorealistic."
3.  **Lighting (BLOCK 3 Logic):**
    * [Based on your *original* analysis of the sketch for blue/green areas, select **ONE** of the following]:
    * (If no blue/green areas were found): "Lighting is warm and soft with physically correct shadows, simulating high-quality interior fixtures."
    * (If blue/green areas *were* found): "Lighting is predominantly natural daylight from the window, soft with physically correct shadows."
4.  **Materials (BLOCK 2 Logic):**
    * [Analyze the user's "dirty prompt" for materials. Extract, clean, and group them. List them in strict order: Floor, Walls, Ceiling, Benches, Niches, Columns, etc.]:
    * (Example:
        Floor: ceramic tile, beige, matte finish.
        Walls, columns: hardwood board, rich brown, smooth polished surface.
        Benches: chestnut board, light-brown, open rustic grain.)
5.  **Final Quality (BLOCK 4):**
    * "Elevate the entire image to the quality of an architectural magazine cover, focusing on photorealistic lighting and textures."

---
Your final output shall ONLY be these two blocks.
`;

// --- Фоллбэки, если LLM не отработает ---
const DEFAULT_STEP1_PROMPT =
  "Fill all window (green/blue) openings with transparent glass viewing {windowView}. Fill the door (red) opening with a transparent glass door viewing {doorView}. Preserve all other geometry and textures.";
const DEFAULT_STEP2_PROMPT =
  "Make the walls from light wood planks. Make the floor from dark stone tiles. Add warm, soft studio lighting. Elevate to photorealistic quality.";

/**
 * ИСПРАВЛЕННЫЙ Парсер ответа от LLM (НОВЫЕ РЕГЕКСПЫ)
 */
function parseLlmResponse(text: string): {
  step1: string;
  step2: string;
} {
  // Используем [\s\S]*? для non-greedy-матчинга, включая новые строки
  // И ищем новые теги ::TAG::
  const step1Match = text.match(
    /::STEP1_START::([\s\S]*?)::STEP1_END::/
  );
  const step2Match = text.match(
    /::STEP2_START::([\s\S]*?)::STEP2_END::/
  );

  const step1 = step1Match ? step1Match[1].trim() : "";
  const step2 = step2Match ? step2Match[1].trim() : "";

  return { step1, step2 };
}

export function usePipelineTest() {
  // --- 1. Файлы (берем dataUrl для LLM) ---
  const {
    sourceFile,
    sourceUrl,
    sourceDataUrl,
    imageInfo,
    fileError,
    dropRef,
    onFileChange,
    onDrop,
    clearFile: clearFileHandler,
  } = useFileHandler();

  // --- 2. Состояние пайплайна ---
  const [step1ResultUrl, setStep1ResultUrl] = useState<string | null>(null);
  const [step2ResultUrl, setStep2ResultUrl] = useState<string | null>(null);

  // --- 3. Состояние UI ---
  const [isLoading, setIsLoading] = useState(false); // Для генерации
  const [isRefining, setIsRefining] = useState(false); // Для LLM
  const [error, setError] = useState<string | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- 4. Промты ---
  const [rawPrompt, setRawPrompt] = useState("");
  const [step1Prompt, setStep1Prompt] = useState(DEFAULT_STEP1_PROMPT);
  const [step2Prompt, setStep2Prompt] = useState(DEFAULT_STEP2_PROMPT);
  const [windowView, setWindowView] = useState("the lake, photorealism, high detail");
  const [doorView, setDoorView] = useState(
    "cozy entrance hall (changing room) with bath towels."
  );
  const [rawLlmResponse, setRawLlmResponse] = useState<string | null>(null); // <<< НОВАЯ ФИЧА

  useEffect(() => {
    if (fileError) setError(fileError);
  }, [fileError]);

  const fail = useCallback((msg: string) => {
    setError(msg);
    setIsLoading(false);
  }, []);

  // --- 5. НОВАЯ ЛОГИКА: Шаг 0 (LLM) ---
  const handleRefine = useCallback(async () => {
    if (!rawPrompt.trim())
      return setRefineError("Сначала напиши грязный промт.");
    if (!sourceDataUrl || !sourceFile)
      return setRefineError("Сначала загрузи скетч.");

    setIsRefining(true);
    setRefineError(null);
    setError(null);
    setRawLlmResponse(null); // <<< НОВАЯ ФИЧА: Сброс
    abortControllerRef.current = new AbortController();

    const finalRawPrompt = `${rawPrompt}\n[VIEW_WINDOW: ${windowView}]\n[VIEW_DOOR: ${doorView}]`;

    const payload = {
      prompt: finalRawPrompt,
      system: STEP_BASED_SYSTEM_PROMPT, // <<< ИСПОЛЬЗУЕМ НОВОЕ ИМЯ
      image: sourceDataUrl,
      model: "gpt-5-mini",
      max_completion_tokens: 6000,
    };

    try {
      const data = await api.refinePrompt(
        payload,
        abortControllerRef.current.signal
      );
      if (!data.refinedPrompt)
        throw new Error("LLM вернул пустой ответ.");

      setRawLlmResponse(data.refinedPrompt); // <<< НОВАЯ ФИЧА: Сохраняем сырой ответ

      // <<< ВОТ ТУТ БЫЛ КОСЯК >>>
      // 1. Правильно деструктурируем
      const { step1, step2 } = parseLlmResponse(data.refinedPrompt);

      // 2. Правильно проверяем
      if (!step1 || !step2) {
        throw new Error(
          "LLM не смог сгенерировать оба промта. (Парсер не нашел ::STEP1_START:: или ::STEP2_START::)"
        );
      }

      // 3. Правильно сохраняем
      setStep1Prompt(step1);
      setStep2Prompt(step2);
      // <<< КОНЕЦ ФИКСА >>>

    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") setRefineError("Отменено.");
        else setRefineError(e.message);
      } else setRefineError("Неизвестная ошибка LLM.");
    } finally {
      setIsRefining(false);
    }
  }, [rawPrompt, sourceDataUrl, sourceFile, windowView, doorView]); // зависимости в порядке

  // --- 6. Логика Шага 1 (Nano Banana) ---
  const handleStep1 = useCallback(async () => {
    if (!sourceFile) return fail("Сначала загрузи скетч.");
    if (!step1Prompt)
      return fail("Промт для Шага 1 пустой. Запусти LLM.");

    setIsLoading(true);
    setError(null);
    setStep1ResultUrl(null);
    setStep2ResultUrl(null);
    abortControllerRef.current = new AbortController();

    const finalStep1Prompt = step1Prompt // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
      .replace("{windowView}", windowView)
      .replace("{doorView}", doorView);

    const formData = new FormData();
    formData.append("image", sourceFile);
      formData.append("prompt", finalStep1Prompt); // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
      formData.append("model", "qwen"); // <<< Тут все еще Qwen, как ты и хотел
      formData.append(
        "settings",
        JSON.stringify({ // <<< ПОМЕНЯЛ
          guidance_scale: 4,
          num_inference_steps: 30,
          seed: Math.floor(Math.random() * 2147483647),
        })
      );

    try {
      const data = await api.generateImage(
        formData,
        abortControllerRef.current.signal
      );
      setStep1ResultUrl(data.imageUrl);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [sourceFile, step1Prompt, windowView, doorView, fail]); // <<< ИСПОЛЬЗUЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ

  // --- 7. Логика Шага 2 (Qwen) ---
  const handleStep2 = useCallback(async () => {
    if (!step1ResultUrl) return fail("Сначала выполни Шаг 1.");
    if (!step2Prompt)
      return fail("Промт для Шага 2 пустой. Запусти LLM.");

    setIsLoading(true);
    setError(null);
    setStep2ResultUrl(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(step1ResultUrl);
      if (!response.ok)
        throw new Error("Не удалось скачать результат Шага 1.");
      const blob = await response.blob();
      const step1File = new File([blob], "step1_result.png", { // <<< Переименовал
        type: blob.type,
      });

      const formData = new FormData();
      formData.append("image", step1File); // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
      formData.append("prompt", step2Prompt); // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
      formData.append("model", "qwen");
      formData.append(
        "settings",
        JSON.stringify({
          guidance_scale: 4,
          num_inference_steps: 30,
          seed: Math.floor(Math.random() * 2147483647),
        })
      );

      const data = await api.generateImage(
        formData,
        abortControllerRef.current.signal
      );
      setStep2ResultUrl(data.imageUrl);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [step1ResultUrl, step2Prompt, fail]); // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЕ ПЕРЕМЕННЫЕ

  // --- 8. Управление ---
  const onCancel = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setIsRefining(false);
    setError("Отменено.");
  };

  const clearAll = () => {
    clearFileHandler();
    setStep1ResultUrl(null);
    setStep2ResultUrl(null);
    setError(null);
    setRefineError(null);
    setRawPrompt("");
    setStep1Prompt(DEFAULT_STEP1_PROMPT); // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
    setStep2Prompt(DEFAULT_STEP2_PROMPT); // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
    setRawLlmResponse(null); // <<< НОВАЯ ФИЧА: Сброс
  };

  // --- 9. Возвращаем API хука ---
  return {
    // Файлы
    sourceFile,
    sourceUrl,
    imageInfo,
    onFileChange,
    onDrop,
    dropRef,

    // Состояние
    isLoading,
    isRefining,
    error,
    refineError,
    step1ResultUrl, // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
    step2ResultUrl, // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ

    // Промты
    rawPrompt,
    setRawPrompt,
    step1Prompt, // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
    setStep1Prompt, // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
    step2Prompt, // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
    setStep2Prompt, // <<< ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ ПЕРЕМЕННУЮ
    windowView,
    setWindowView,
    doorView,
    setDoorView,
    rawLlmResponse, // <<< НОВАЯ ФИЧА: Экспорт

    // Действия
    handleRefine,
    handleStep1,
    handleStep2,
    onCancel,
    clearAll,
  };
}
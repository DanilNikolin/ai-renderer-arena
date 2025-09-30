// src/lib/api.ts

/**
 * Отправляет запрос на генерацию изображения.
 * @param formData - FormData с изображением, промптом и настройками.
 * @param signal - AbortSignal для отмены запроса.
 * @returns - JSON-ответ от сервера.
 */
export async function generateImage(formData: FormData, signal: AbortSignal) {
  const response = await fetch("/api/generate", {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Неизвестная ошибка API при генерации");
  }

  return await response.json();
}

/**
 * Отправляет запрос на улучшение промпта.
 * @param payload - Тело запроса для LLM.
 * @param signal - AbortSignal для отмены запроса.
 * @returns - JSON-ответ от сервера.
 */
export async function refinePrompt(payload: object, signal: AbortSignal) {
  const response = await fetch("/api/refine-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Неизвестная ошибка API при улучшении промпта");
  }

  return await response.json();
}
// src/lib/image.server.ts
// Используем 'use server' на уровне файла, чтобы Next.js точно не втянул это в клиент
'use server';

import sharp from 'sharp';

/**
 * Получает нативный размер изображения из буфера.
 * Возвращает null в случае ошибки.
 */
export async function getImageSizeFromBuffer(
  buf: Buffer,
): Promise<{ width: number; height: number } | null> {
  try {
    const meta = await sharp(buf).metadata();
    if (meta.width && meta.height) {
      return { width: meta.width, height: meta.height };
    }
    return null;
  } catch (e) {
    // Не спамим в консоль, если это не ошибка
    if (e instanceof Error) {
      console.error(`[getImageSizeFromBuffer] Ошибка Sharp: ${e.message}`);
    }
    return null;
  }
}
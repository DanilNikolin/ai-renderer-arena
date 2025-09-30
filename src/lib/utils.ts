// src/lib/utils.ts

import { PersistState } from "./types";

/**
 * Утилита для склейки CSS-классов.
 */
export function cx(...s: (string | false | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

/**
 * Читает размеры изображения из файла.
 */
export function readImageDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Загружает состояние из localStorage.
 */
export function loadPersist(): PersistState | null {
  try {
    const raw = localStorage.getItem("image_workspace_v2");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Сохраняет состояние в localStorage.
 */
export function savePersist(s: PersistState) {
  try {
    // Создаем глубокую копию, чтобы не мутировать оригинальный state
    const stateToSave = JSON.parse(JSON.stringify(s));

    // Вырезаем жирные Data URL из baseResults
    if (stateToSave.baseResults) {
      stateToSave.baseResults.forEach((node: GenerationNode) => {
        delete (node as any).sourceImageUrl;
      });
    }
    // И из всех воркспейсов
    if (stateToSave.workspaces) {
      Object.keys(stateToSave.workspaces).forEach(wsId => {
        stateToSave.workspaces[wsId].forEach((node: GenerationNode) => {
          delete (node as any).sourceImageUrl;
        });
      });
    }

    localStorage.setItem("image_workspace_v2", JSON.stringify(stateToSave));
  } catch (e) {
    console.error("НЕ УДАЛОСЬ СОХРАНИТЬ СОСТОЯНИЕ:", e);
  }
}
// src/hooks/useFileHandler.ts
import { useState, useCallback, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import { readImageDims } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from "@/lib/types";

export function useFileHandler() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null); // <<< ВОТ ОНА, РОДИМАЯ
  const [imageInfo, setImageInfo] = useState<{ w: number; h: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const dropRef = useRef<HTMLLabelElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return setFileError(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return setFileError("Неверный тип файла. Используйте PNG, JPEG или WebP.");
    }
    
    setFileError(null);
    setSourceFile(file);

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    const url = URL.createObjectURL(file);
    setSourceUrl(url);

    const reader = new FileReader();
    reader.onload = () => {
      setSourceDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const dims = await readImageDims(file);
      setImageInfo(dims);
    } catch {
      setImageInfo(null);
    }
  }, [sourceUrl]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onPaste = useCallback(async (e: globalThis.ClipboardEvent) => {
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

  const clearFile = () => {
    setSourceFile(null);
    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }
    setSourceUrl(null);
    setSourceDataUrl(null);
    setImageInfo(null);
    setFileError(null);
  };

  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onPaste]);

  useEffect(() => {
    return () => {
      if (sourceUrl && sourceUrl.startsWith("blob:")) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]);

  return {
    sourceFile,
    sourceUrl,
    sourceDataUrl,
    imageInfo,
    fileError,
    dropRef,
    onFileChange,
    onDrop,
    clearFile,
  };
}
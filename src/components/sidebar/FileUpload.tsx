// src/components/sidebar/FileUpload.tsx
import React, { ChangeEvent, DragEvent, RefObject } from "react";
import { cx } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from "@/lib/types";
import { Label } from "@/components/ui/FormControls";

interface FileUploadProps {
  imageInfo: { w: number; h: number } | null;
  sourceFile: File | null;
  dropRef: RefObject<HTMLLabelElement | null>;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  imageInfo,
  sourceFile,
  dropRef,
  onDrop,
  onFileChange,
}) => {
  return (
    <div className="space-y-2">
      <Label
        title={"Исходное изображение (скетч)"}
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
          "group border border-dashed rounded-lg cursor-pointer transition",
          "border-gray-700 hover:border-cyan-500 bg-gray-900/50",
          "flex items-center justify-center min-h-[92px]" // Внешний контейнер теперь flex-контейнер
        )}
        title="Перетащи файл или кликни. Можно также вставить из буфера Ctrl+V."
      >
        {/* А весь контент живет в отдельном блоке, который уже не влияет на рамку */}
        <div className="p-2 text-center">
          {sourceFile ? (
            <div className="text-left space-y-1">
              <p className="text-cyan-400 text-sm font-medium truncate">
                {sourceFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(sourceFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {sourceFile.type.replace("image/", "").toUpperCase()}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-400">
                Перетащи или нажми, чтобы выбрать
              </p>
              <p className="text-xs text-gray-500">
                {ACCEPTED_FILE_TYPES.map(t => t.replace('image/', '')).join(', ').toUpperCase()} • до {MAX_FILE_SIZE_MB}MB • Ctrl+V
              </p>
            </div>
          )}
        </div>
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept={ACCEPTED_FILE_TYPES.join(",")}
          onChange={onFileChange}
        />
      </label>
    </div>
  );
};
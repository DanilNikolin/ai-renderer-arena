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
        title={"Source Image (Sketch)"}
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
          "flex items-center justify-center min-h-[92px]" // External container is now flex
        )}
        title="Drag file or click. You can also paste from clipboard (Ctrl+V)."
      >
        {/* Content lives in a separate block that doesn't affect the border */}
        {/* <<< FIX: Added min-w-0 for truncate to work in flex container */}
        <div className="p-2 text-center min-w-0">
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
                Drag or click to select
              </p>
              <p className="text-xs text-gray-500">
                {ACCEPTED_FILE_TYPES.map(t => t.replace('image/', '')).join(', ').toUpperCase()} • up to {MAX_FILE_SIZE_MB}MB • Ctrl+V
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